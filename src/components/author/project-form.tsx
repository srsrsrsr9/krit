"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface RubricLevel { label: string; points: number; }
interface RubricCriterion { criterion: string; levels: RubricLevel[]; }

export function ProjectForm({
  initial,
}: {
  initial?: {
    id: string;
    slug: string;
    title: string;
    prompt: string;
    rubric: RubricCriterion[];
  };
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [rubric, setRubric] = useState<RubricCriterion[]>(initial?.rubric ?? [
    { criterion: "Correctness", levels: [{ label: "Fully correct", points: 3 }, { label: "Minor issues", points: 2 }, { label: "Wrong", points: 0 }] },
  ]);
  const [saving, setSaving] = useState(false);

  function updateCrit(i: number, patch: Partial<RubricCriterion>) {
    setRubric((r) => r.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }
  function updateLevel(ci: number, li: number, patch: Partial<RubricLevel>) {
    setRubric((r) => r.map((c, idx) => idx === ci ? { ...c, levels: c.levels.map((l, lj) => lj === li ? { ...l, ...patch } : l) } : c));
  }

  async function save() {
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/projects/${initial.id}` : "/api/admin/projects", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slug.trim(), title: title.trim(), prompt, rubric }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed"); return;
    }
    toast.success("Saved.");
    router.push("/workspace/projects"); router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Slug"><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="capstone-five-queries" /></Field>
          </div>
          <Field label="Brief (Markdown)"><Textarea rows={14} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="font-mono text-sm" /></Field>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rubric</h2>
          <Button size="sm" variant="outline" onClick={() => setRubric((r) => [...r, { criterion: "New criterion", levels: [{ label: "Strong", points: 3 }, { label: "Weak", points: 0 }] }])} className="gap-1">
            <Plus className="h-3 w-3" /> Add criterion
          </Button>
        </div>
        <div className="space-y-3">
          {rubric.map((c, ci) => (
            <Card key={ci}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Input value={c.criterion} onChange={(e) => updateCrit(ci, { criterion: e.target.value })} placeholder="Criterion (e.g. Correctness)" />
                  <button onClick={() => setRubric((r) => r.filter((_, idx) => idx !== ci))} className="rounded p-2 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="space-y-1.5">
                  {c.levels.map((l, li) => (
                    <div key={li} className="flex items-center gap-2">
                      <Input type="number" min={0} value={l.points} onChange={(e) => updateLevel(ci, li, { points: parseInt(e.target.value, 10) || 0 })} className="w-20" />
                      <Input value={l.label} onChange={(e) => updateLevel(ci, li, { label: e.target.value })} placeholder="Level description" />
                      <button onClick={() => updateCrit(ci, { levels: c.levels.filter((_, idx) => idx !== li) })} className="rounded p-1 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => updateCrit(ci, { levels: [...c.levels, { label: "", points: 0 }] })} type="button">Add level</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div><Button onClick={save} disabled={saving || !title || !slug || !prompt}>{saving ? "Saving…" : initial ? "Save changes" : "Create project"}</Button></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
