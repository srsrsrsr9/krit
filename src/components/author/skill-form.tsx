"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface SkillFormProps {
  initial?: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    decayDays: number | null;
    prerequisiteIds: string[];
  };
  allSkills: { id: string; name: string; slug: string }[];
}

export function SkillForm({ initial, allSkills }: SkillFormProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [decayDays, setDecayDays] = useState(initial?.decayDays?.toString() ?? "");
  const [prereqIds, setPrereqIds] = useState<string[]>(initial?.prerequisiteIds ?? []);
  const [saving, setSaving] = useState(false);

  function togglePrereq(id: string) {
    setPrereqIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function save() {
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/skills/${initial.id}` : "/api/admin/skills", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        decayDays: decayDays ? parseInt(decayDays, 10) : null,
        prerequisiteIds: prereqIds,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed");
      return;
    }
    toast.success("Saved.");
    router.push("/workspace/skills");
    router.refresh();
  }

  async function archive() {
    if (!initial || !confirm("Archive this skill? Existing evidence is preserved.")) return;
    const res = await fetch(`/api/admin/skills/${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Archived.");
      router.push("/workspace/skills");
      router.refresh();
    } else toast.error("Archive failed.");
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SQL joins" />
          </Field>
          <Field label="Slug" hint="URL-safe, unique within workspace">
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="sql-joins" />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category" hint="e.g. Data, Communication, Compliance">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <Field label="Re-verify after (days)" hint="Leave blank for no decay">
            <Input type="number" min={0} value={decayDays} onChange={(e) => setDecayDays(e.target.value)} />
          </Field>
        </div>
        <Field label="Prerequisites" hint="Other skills that must come first">
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
            {allSkills
              .filter((s) => s.id !== initial?.id)
              .map((s) => {
                const on = prereqIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => togglePrereq(s.id)}
                    className={`rounded-md border px-2.5 py-1.5 text-left text-xs ${on ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent/40"}`}
                  >
                    {s.name}
                  </button>
                );
              })}
          </div>
        </Field>
        <div className="flex items-center justify-between pt-2">
          <Button onClick={save} disabled={saving || !name || !slug}>
            {saving ? "Saving…" : initial ? "Save changes" : "Create skill"}
          </Button>
          {initial && (
            <Button variant="ghost" onClick={archive} className="text-destructive">
              Archive
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
