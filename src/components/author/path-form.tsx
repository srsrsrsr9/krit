"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Trash2, Plus, BookOpen, ClipboardCheck, FolderOpen } from "lucide-react";

type ItemKind = "LESSON" | "ASSESSMENT" | "PROJECT";
type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type Level = "NOVICE" | "WORKING" | "PROFICIENT" | "EXPERT";
type Kind = "PATH" | "COLLECTION" | "COHORT" | "COMPLIANCE";

interface Item {
  kind: ItemKind;
  refId: string;     // lessonId / assessmentId / projectId
  title: string;
  required: boolean;
}

interface CatalogEntry { id: string; title: string; slug?: string; }

export function PathForm({
  initial,
  catalog,
}: {
  initial?: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    summary: string | null;
    kind: Kind;
    status: Status;
    level: Level;
    estimatedMinutes: number | null;
    items: Item[];
  };
  catalog: { lessons: CatalogEntry[]; assessments: CatalogEntry[]; projects: CatalogEntry[] };
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [kind, setKind] = useState<Kind>(initial?.kind ?? "PATH");
  const [status, setStatus] = useState<Status>(initial?.status ?? "DRAFT");
  const [level, setLevel] = useState<Level>(initial?.level ?? "NOVICE");
  const [minutes, setMinutes] = useState(initial?.estimatedMinutes?.toString() ?? "");
  const [items, setItems] = useState<Item[]>(initial?.items ?? []);
  const [addType, setAddType] = useState<ItemKind>("LESSON");
  const [saving, setSaving] = useState(false);

  function move(i: number, d: number) {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j]!, next[i]!]; setItems(next);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/paths/${initial.id}` : "/api/admin/paths", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        summary: summary.trim() || null,
        kind, status, level,
        estimatedMinutes: minutes ? parseInt(minutes, 10) : null,
        items,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed"); return;
    }
    toast.success("Saved.");
    router.push("/workspace/paths"); router.refresh();
  }

  const sourceFor = (k: ItemKind) =>
    k === "LESSON" ? catalog.lessons : k === "ASSESSMENT" ? catalog.assessments : catalog.projects;

  function addItem(refId: string) {
    const src = sourceFor(addType).find((s) => s.id === refId);
    if (!src) return;
    if (items.find((it) => it.refId === refId && it.kind === addType)) {
      toast.error("Already in path."); return;
    }
    setItems((s) => [...s, { kind: addType, refId, title: src.title, required: true }]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Slug"><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="sql-foundations" /></Field>
          </div>
          <Field label="Subtitle"><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></Field>
          <Field label="Summary"><Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Kind">
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                <option value="PATH">Path</option><option value="COLLECTION">Collection</option><option value="COHORT">Cohort</option><option value="COMPLIANCE">Compliance</option>
              </select>
            </Field>
            <Field label="Level">
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                <option value="NOVICE">Novice</option><option value="WORKING">Working</option><option value="PROFICIENT">Proficient</option><option value="EXPERT">Expert</option>
              </select>
            </Field>
            <Field label="Estimated (min)"><Input type="number" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></Field>
            <Field label="Status">
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
              </select>
            </Field>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items ({items.length})</h2>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={`${it.kind}-${it.refId}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <span className="text-xs font-mono text-muted-foreground w-6 text-center">{i + 1}</span>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                {it.kind === "LESSON" ? <BookOpen className="h-4 w-4" /> : it.kind === "ASSESSMENT" ? <ClipboardCheck className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.kind}</div>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={it.required} onChange={(e) => setItems((s) => s.map((x, idx) => idx === i ? { ...x, required: e.target.checked } : x))} />
                Required
              </label>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" type="button"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" type="button"><ChevronDown className="h-4 w-4" /></button>
                <button onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))} className="rounded p-1 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No items yet.</div>}
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-border p-3">
          <div className="mb-2 flex items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground">Add</span>
            {(["LESSON", "ASSESSMENT", "PROJECT"] as ItemKind[]).map((k) => (
              <button key={k} type="button" onClick={() => setAddType(k)} className={`rounded-md border px-2 py-1 ${addType === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent/40"}`}>
                {k}
              </button>
            ))}
          </div>
          <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
            {sourceFor(addType).map((src) => {
              const used = items.some((it) => it.refId === src.id && it.kind === addType);
              return (
                <button key={src.id} type="button" disabled={used} onClick={() => addItem(src.id)}
                  className={`flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-left text-xs ${used ? "opacity-40" : "hover:bg-accent/40"}`}>
                  <span className="truncate">{src.title}</span>
                  {used ? <Badge variant="outline">added</Badge> : <Plus className="h-3 w-3" />}
                </button>
              );
            })}
            {sourceFor(addType).length === 0 && <div className="text-xs text-muted-foreground">No {addType.toLowerCase()}s in this workspace yet.</div>}
          </div>
        </div>
      </div>

      <div><Button onClick={save} disabled={saving || !title || !slug}>{saving ? "Saving…" : initial ? "Save changes" : "Create path"}</Button></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
