"use client";

import { useState } from "react";
import { CelebrationOverlay } from "./celebration-overlay";

/**
 * Wraps CelebrationOverlay with a "show once on this mount, dismissible"
 * boundary. Used on the assessment result page when a path-credential
 * was just issued.
 */
export function MaybeCelebration({
  title,
  learner,
  issueDate,
  code,
  skills,
  credentialUrl,
}: {
  title: string;
  learner: string;
  issueDate: string;
  code: string;
  skills: { label: string; count: number }[];
  credentialUrl: string;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <CelebrationOverlay
      title={title}
      learner={learner}
      issueDate={issueDate}
      code={code}
      skills={skills}
      credentialUrl={credentialUrl}
      onDismiss={() => setOpen(false)}
    />
  );
}
