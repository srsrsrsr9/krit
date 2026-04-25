"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

type Level = "NOVICE" | "WORKING" | "PROFICIENT" | "EXPERT";
interface Req { skillId: string; requiredLevel: Level; }

export function RoleProfileForm({
  initial,
  skills,
}: {
  initial?: { id: string; name: string; description: string | null; requirements: Req[] };
  skills: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [reqs, setReqs] = useState<Req[]>(initial?.requirements ?? []);
  const [saving, setSaving] = useState(false);

  function add() {
    const remaining = skills.filter((s) => !reqs.find((r) => r.skillId === s.id));
    if (remaining.length === 0) return;
    setReqs([...reqs, { skillId: remaining[0]!.id, requiredLevel: "WORKING" }]);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/role-profiles/${initial.id}` : "/api/admin/role-profiles", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || null, requirements: reqs }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Save failed."); return;
    }
    toast.success("Saved.");
    router.push("/workspace/settings"); router.refresh();
  }

  async function remove() {
    if (!initial || !confirm("Delete this role profile?")) return;
    const res = await fetch(`/api/admin/role-profiles/${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted.");
      router.push("/workspace/settings"); router.refresh();
    } else toast.error("Delete failed.");
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Senior Backend Engineer" /></Field>
        </div>
        <Field label="Description"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Required skills</span>
            <Button size="sm" variant="outline" type="button" onClick={add}>Add requirement</Button>
          </div>
          <div className="space-y-2">
            {reqs.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <select className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm" value={r.skillId} onChange={(e) => setReqs(reqs.map((x, idx) => idx === i ? { ...x, skillId: e.target.value } : x))}>
                  {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="h-9 w-32 rounded-md border border-input bg-background px-2 text-sm" value={r.requiredLevel} onChange={(e) => setReqs(reqs.map((x, idx) => idx === i ? { ...x, requiredLevel: e.target.value as Level } : x))}>
                  <option value="NOVICE">Novice</option><option value="WORKING">Working</option><option value="PROFICIENT">Proficient</option><option value="EXPERT">Expert</option>
                </select>
                <button type="button" onClick={() => setReqs(reqs.filter((_, idx) => idx !== i))} className="rounded p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {reqs.length === 0 && <p className="text-sm text-muted-foreground">No skill requirements yet.</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={save} disabled={saving || !name}>{saving ? "Saving…" : initial ? "Save changes" : "Create role profile"}</Button>
          {initial && <Button variant="ghost" onClick={remove} className="text-destructive">Delete</Button>}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
