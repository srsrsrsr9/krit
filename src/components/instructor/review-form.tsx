"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface RubricItem { criterion: string; levels: { label: string; points: number }[]; }

export function ReviewForm({
  submissionId,
  rubric,
  existingScores,
  existingNotes,
  status,
}: {
  submissionId: string;
  rubric: RubricItem[];
  existingScores: Record<string, number>;
  existingNotes: string;
  status: string;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>(existingScores);
  const [notes, setNotes] = useState(existingNotes);
  const [saving, setSaving] = useState(false);

  const totalPossible = rubric.reduce((s, r) => s + Math.max(0, ...r.levels.map((l) => l.points)), 0);
  const total = Object.values(scores).reduce((s, n) => s + n, 0);
  const pct = totalPossible > 0 ? Math.round((total / totalPossible) * 100) : 0;

  async function submit(action: "review" | "request_revision") {
    setSaving(true);
    const res = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, scores, notes }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed."); return;
    }
    toast.success(action === "review" ? "Reviewed and approved." : "Revision requested.");
    router.push("/workspace/review");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Rubric scoring</span>
          <span className="text-xs text-muted-foreground">{total} / {totalPossible} ({pct}%)</span>
        </div>
        {rubric.map((r, i) => (
          <div key={i} className="space-y-1.5">
            <div className="text-sm font-medium">{r.criterion}</div>
            <div className="space-y-1">
              {r.levels.map((l, li) => {
                const checked = scores[r.criterion] === l.points;
                return (
                  <label key={li} className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"}`}>
                    <input type="radio" name={`crit-${i}`} className="mt-1" checked={checked} onChange={() => setScores((s) => ({ ...s, [r.criterion]: l.points }))} />
                    <div className="flex-1"><span className="font-mono text-xs text-muted-foreground">+{l.points}</span> {l.label}</div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        <div>
          <div className="mb-1 text-sm font-medium">Reviewer notes</div>
          <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Feedback for the learner…" />
        </div>
        <div className="space-y-2">
          <Button onClick={() => submit("review")} disabled={saving} className="w-full">
            {saving ? "Saving…" : "Approve & award skill evidence"}
          </Button>
          <Button onClick={() => submit("request_revision")} disabled={saving} variant="outline" className="w-full">
            Request revision
          </Button>
        </div>
        {status === "REVIEWED" && (
          <p className="text-xs text-muted-foreground">Already reviewed. New scores overwrite the old.</p>
        )}
      </CardContent>
    </Card>
  );
}
