"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Kind = "CORPORATE" | "ACADEMY" | "PERSONAL";

export function WorkspaceSettingsForm({
  initial,
}: {
  initial: { id: string; name: string; slug: string; kind: Kind; logoUrl: string | null; description: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [kind, setKind] = useState<Kind>(initial.kind);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/workspace`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, kind, logoUrl: logoUrl || null, description: description || null }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Save failed."); return;
    }
    toast.success("Saved.");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Slug"><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Kind">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              <option value="CORPORATE">Corporate</option><option value="ACADEMY">Academy (retail)</option><option value="PERSONAL">Personal</option>
            </select>
          </Field>
          <Field label="Logo URL"><Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" /></Field>
        </div>
        <Field label="Description"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
