"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";

type Kind = "MCQ_SINGLE" | "MCQ_MULTI";
type Mode = "PRACTICE" | "GRADED" | "PROCTORED" | "ADAPTIVE";

interface Choice { id: string; label: string; correct: boolean; explain?: string }
interface Q {
  kind: Kind;
  stem: string;
  choices: Choice[];
  points: number;
  explanation?: string;
  skillSlug?: string | null;
}

interface SkillOpt { id: string; name: string; slug: string; }

export function AssessmentForm({
  initial,
  skills,
}: {
  initial?: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    mode: Mode;
    passThreshold: number;
    timeLimitSec: number | null;
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    skillIds: string[];
    questions: Q[];
  };
  skills: SkillOpt[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [mode, setMode] = useState<Mode>(initial?.mode ?? "GRADED");
  const [passThreshold, setPassThreshold] = useState(initial?.passThreshold?.toString() ?? "70");
  const [timeLimitMin, setTimeLimitMin] = useState(initial?.timeLimitSec ? Math.round(initial.timeLimitSec / 60).toString() : "");
  const [attempts, setAttempts] = useState(initial?.attemptsAllowed?.toString() ?? "3");
  const [shuffle, setShuffle] = useState(initial?.shuffleQuestions ?? true);
  const [skillIds, setSkillIds] = useState<string[]>(initial?.skillIds ?? []);
  const [questions, setQuestions] = useState<Q[]>(initial?.questions ?? []);
  const [saving, setSaving] = useState(false);

  function update(i: number, patch: Partial<Q>) {
    setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  }
  function move(i: number, d: number) {
    const j = i + d; if (j < 0 || j >= questions.length) return;
    setQuestions((qs) => { const next = [...qs]; [next[i], next[j]] = [next[j]!, next[i]!]; return next; });
  }
  function add(kind: Kind) {
    setQuestions((qs) => [...qs, {
      kind, stem: "Question text", points: 1, explanation: "",
      choices: [
        { id: "a", label: "Option A", correct: kind === "MCQ_SINGLE" },
        { id: "b", label: "Option B", correct: false },
      ],
    }]);
  }

  async function save() {
    setSaving(true);
    const body = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim() || null,
      mode,
      passThreshold: parseInt(passThreshold, 10) || 70,
      timeLimitSec: timeLimitMin ? parseInt(timeLimitMin, 10) * 60 : null,
      attemptsAllowed: Math.max(1, parseInt(attempts, 10) || 1),
      shuffleQuestions: shuffle,
      skillIds,
      questions,
    };
    const res = await fetch(initial ? `/api/admin/assessments/${initial.id}` : "/api/admin/assessments", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed"); return;
    }
    toast.success("Saved.");
    router.push("/workspace/assessments");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Slug"><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="sql-foundations-assessment" /></Field>
          </div>
          <Field label="Description"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Mode">
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="PRACTICE">Practice</option><option value="GRADED">Graded</option><option value="PROCTORED">Proctored</option><option value="ADAPTIVE">Adaptive</option>
              </select>
            </Field>
            <Field label="Pass %"><Input type="number" min={0} max={100} value={passThreshold} onChange={(e) => setPassThreshold(e.target.value)} /></Field>
            <Field label="Time limit (min)"><Input type="number" min={0} value={timeLimitMin} onChange={(e) => setTimeLimitMin(e.target.value)} placeholder="No limit" /></Field>
            <Field label="Attempts"><Input type="number" min={1} value={attempts} onChange={(e) => setAttempts(e.target.value)} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} /> Shuffle questions on each attempt</label>
          <Field label="Skills this assessment evidences">
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => {
                const on = skillIds.includes(s.id);
                return <button key={s.id} type="button" onClick={() => setSkillIds((cur) => cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id])}
                  className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent/40"}`}>{s.name}</button>;
              })}
            </div>
          </Field>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Questions ({questions.length})</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => add("MCQ_SINGLE")} className="gap-1"><Plus className="h-3 w-3" />Single-answer</Button>
            <Button size="sm" variant="outline" onClick={() => add("MCQ_MULTI")} className="gap-1"><Plus className="h-3 w-3" />Multi-answer</Button>
          </div>
        </div>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{i + 1}</Badge>
                    <Badge variant="secondary">{q.kind === "MCQ_SINGLE" ? "Single" : "Multi"}</Badge>
                    <Input type="number" min={1} value={q.points} onChange={(e) => update(i, { points: parseInt(e.target.value, 10) || 1 })} className="h-8 w-20" />
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" type="button"><ChevronUp className="h-4 w-4" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === questions.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" type="button"><ChevronDown className="h-4 w-4" /></button>
                    <button onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))} className="rounded p-1 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <Textarea rows={2} value={q.stem} onChange={(e) => update(i, { stem: e.target.value })} placeholder="Question stem (markdown supported)" />
                <div className="space-y-1.5">
                  {q.choices.map((c, ci) => (
                    <div key={ci} className="flex items-start gap-2">
                      <input type={q.kind === "MCQ_MULTI" ? "checkbox" : "radio"} name={`q${i}`} checked={c.correct} onChange={(e) => {
                        const next = q.kind === "MCQ_MULTI"
                          ? q.choices.map((x, idx) => idx === ci ? { ...x, correct: e.target.checked } : x)
                          : q.choices.map((x, idx) => ({ ...x, correct: idx === ci }));
                        update(i, { choices: next });
                      }} className="mt-2.5" />
                      <div className="flex-1 space-y-1">
                        <Input value={c.label} onChange={(e) => update(i, { choices: q.choices.map((x, idx) => idx === ci ? { ...x, label: e.target.value } : x) })} placeholder="Choice text" />
                        <Input value={c.explain ?? ""} onChange={(e) => update(i, { choices: q.choices.map((x, idx) => idx === ci ? { ...x, explain: e.target.value } : x) })} placeholder="Why this is right/wrong (optional)" className="text-xs" />
                      </div>
                      <button onClick={() => update(i, { choices: q.choices.filter((_, idx) => idx !== ci) })} className="rounded p-1 text-muted-foreground hover:text-destructive" type="button"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" type="button" onClick={() => {
                    const id = String.fromCharCode(97 + q.choices.length);
                    update(i, { choices: [...q.choices, { id, label: "", correct: false, explain: "" }] });
                  }}>Add choice</Button>
                </div>
                <Input value={q.explanation ?? ""} onChange={(e) => update(i, { explanation: e.target.value })} placeholder="Question-level explanation (shown after submit)" />
                <select className="h-9 w-full max-w-sm rounded-md border border-input bg-background px-2 text-sm" value={q.skillSlug ?? ""} onChange={(e) => update(i, { skillSlug: e.target.value || null })}>
                  <option value="">Map to skill (optional, for item analytics)</option>
                  {skills.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                </select>
              </CardContent>
            </Card>
          ))}
          {questions.length === 0 && (
            <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No questions yet — add one above.</CardContent></Card>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={save} disabled={saving || !title || !slug || questions.length === 0}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create assessment"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
