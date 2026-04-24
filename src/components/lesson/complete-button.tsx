"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function CompleteLessonButton({
  lessonId,
  pathSlug,
  nextHref,
  alreadyComplete,
}: {
  lessonId: string;
  pathSlug: string;
  nextHref: string | null;
  alreadyComplete: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyComplete);
  const [loading, setLoading] = useState(false);

  async function complete() {
    setLoading(true);
    const res = await fetch("/api/progress/complete-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, pathSlug }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not mark complete. Try again.");
      return;
    }
    setDone(true);
    toast.success("Lesson complete — evidence recorded.");
    if (nextHref) router.push(nextHref);
    else router.refresh();
  }

  if (done) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed
      </Button>
    );
  }

  return (
    <Button onClick={complete} disabled={loading} className="gap-2">
      {loading ? "Saving…" : nextHref ? "Complete & continue" : "Complete lesson"}
    </Button>
  );
}
