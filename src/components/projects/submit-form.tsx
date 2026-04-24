"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectSubmitForm({
  projectId,
  pathSlug,
  existing,
}: {
  projectId: string;
  pathSlug: string | null;
  existing: {
    id: string;
    content: string;
    status: string;
    reviewNotes: string | null;
    rubricScore: Record<string, number> | null;
  } | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState(existing?.content ?? "");
  const [submitting, setSubmitting] = useState(false);

  const readOnly = existing?.status === "SUBMITTED" || existing?.status === "REVIEWING" || existing?.status === "REVIEWED";

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/projects/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, content, pathSlug }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Submission failed.");
      return;
    }
    toast.success("Submitted for review.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {existing?.status === "REVIEWED" && (
        <Card className="border-emerald-500/40">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2">
              <Badge variant="success">Reviewed</Badge>
              <span className="text-xs text-muted-foreground">Reviewer notes</span>
            </div>
            <p className="text-sm">{existing.reviewNotes ?? "No notes."}</p>
            {existing.rubricScore && (
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
                {Object.entries(existing.rubricScore).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded border border-border px-2 py-1">
                    <span>{k}</span>
                    <span className="font-mono text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {existing?.status === "SUBMITTED" && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Submitted — awaiting reviewer.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Your submission (Markdown)</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="font-mono text-sm"
          disabled={readOnly}
          placeholder="Paste your queries, link to a repo, or write your answers in Markdown…"
        />
      </div>
      {!readOnly && (
        <Button onClick={submit} disabled={submitting || content.trim().length < 10}>
          {submitting ? "Submitting…" : existing ? "Re-submit" : "Submit for review"}
        </Button>
      )}
    </div>
  );
}
