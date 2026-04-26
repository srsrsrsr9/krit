"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BlockEditor } from "./block-editor";
import type { ContentBlock } from "@/lib/content/blocks";
import { LessonBlocks } from "@/lib/content/blocks";

interface SkillOpt { id: string; name: string; }

export function LessonForm({
  initial,
  skills,
}: {
  initial?: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    estimatedMinutes: number;
    blocks: ContentBlock[];
    skillIds: string[];
  };
  skills: SkillOpt[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [minutes, setMinutes] = useState(initial?.estimatedMinutes?.toString() ?? "5");
  const [skillIds, setSkillIds] = useState<string[]>(initial?.skillIds ?? []);
  const [blocks, setBlocks] = useState<ContentBlock[]>(initial?.blocks ?? []);
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSkillIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function save() {
    const parsed = LessonBlocks.safeParse(blocks);
    if (!parsed.success) {
      toast.error(`Block validation failed: ${parsed.error.issues[0]?.message ?? "unknown"}`);
      return;
    }
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/lessons/${initial.id}` : "/api/admin/lessons", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        estimatedMinutes: Math.max(1, parseInt(minutes, 10) || 5),
        blocks: parsed.data,
        skillIds,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed");
      return;
    }
    toast.success("Saved.");
    router.push("/workspace/lessons");
    router.refresh();
  }

  async function archive() {
    if (!initial || !confirm("Delete this lesson? It must not be in use by any path.")) return;
    const res = await fetch(`/api/admin/lessons/${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted.");
      router.push("/workspace/lessons");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is SQL" />
            </Field>
            <Field label="Slug">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="what-is-sql" />
            </Field>
          </div>
          <Field label="Subtitle">
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </Field>
          <Field label="Estimated minutes">
            <Input type="number" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="max-w-[120px]" />
          </Field>
          <Field label="Skills this lesson develops">
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => {
                const on = skillIds.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)}
                    className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent/40"}`}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </Field>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Content blocks</h2>
        <BlockEditor blocks={blocks} onChange={setBlocks} lessonTitle={title} />
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={save} disabled={saving || !title || !slug}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create lesson"}
        </Button>
        {initial && (
          <Button variant="ghost" onClick={archive} className="text-destructive">Delete lesson</Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
