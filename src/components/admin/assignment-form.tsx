"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

interface PersonOpt { id: string; name: string; email: string; role: string; }
interface PathOpt { id: string; title: string; }

export function AssignmentForm({
  paths,
  people,
}: {
  paths: PathOpt[];
  people: PersonOpt[];
}) {
  const router = useRouter();
  const [pathId, setPathId] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [compliance, setCompliance] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return people.filter((p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }, [filter, people]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function selectAllVisible() {
    setSelected((s) => Array.from(new Set([...s, ...filtered.map((p) => p.id)])));
  }

  async function save() {
    if (!pathId || selected.length === 0) {
      toast.error("Pick a path and at least one person."); return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathId,
        assignedToIds: selected,
        reason: reason.trim() || null,
        dueAt: dueAt || null,
        compliance,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Assign failed"); return;
    }
    const j = await res.json();
    toast.success(`Created ${j.created} assignment${j.created === 1 ? "" : "s"}.`);
    router.push("/workspace/assignments");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Field label="Path">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={pathId} onChange={(e) => setPathId(e.target.value)}>
                <option value="">Select a path…</option>
                {paths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Onboarding, Q2 compliance…" /></Field>
              <Field label="Due date"><Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={compliance} onChange={(e) => setCompliance(e.target.checked)} />
              Compliance assignment (stricter tracking, audit-friendly)
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter people by name, email, or role…" />
              <Button size="sm" variant="outline" onClick={selectAllVisible} type="button">Select all visible</Button>
            </div>
            <div className="max-h-[480px] space-y-1 overflow-y-auto">
              {filtered.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => toggle(p.id)}
                    className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm ${on ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"}`}>
                    <input type="checkbox" checked={on} readOnly className="pointer-events-none" />
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{initials(p.name)}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </div>
                    <Badge variant="outline">{p.role}</Badge>
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground">No matches.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="text-sm font-semibold">Summary</div>
            <div className="text-sm text-muted-foreground">
              {selected.length} {selected.length === 1 ? "person" : "people"} will be assigned the selected path.
              {dueAt && <> Due {new Date(dueAt).toLocaleDateString()}.</>}
              {compliance && <> Tracked as compliance.</>}
            </div>
            <Button onClick={save} disabled={saving || !pathId || selected.length === 0} className="w-full">
              {saving ? "Creating…" : `Create ${selected.length} assignment${selected.length === 1 ? "" : "s"}`}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
