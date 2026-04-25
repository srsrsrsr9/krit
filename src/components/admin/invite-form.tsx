"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2 } from "lucide-react";

const ROLES = ["LEARNER", "AUTHOR", "INSTRUCTOR", "MANAGER", "ADMIN"] as const;

export function InviteForm({
  invites,
  roleProfiles,
}: {
  invites: { id: string; token: string; role: string; maxUses: number; uses: number; expiresAt: string | null; createdAt: string; link: string }[];
  roleProfiles: { id: string; name: string }[];
  baseUrl: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string>("LEARNER");
  const [roleProfileId, setRoleProfileId] = useState<string>("");
  const [maxUses, setMaxUses] = useState("1");
  const [days, setDays] = useState("14");
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        roleProfileId: roleProfileId || null,
        maxUses: Math.max(1, parseInt(maxUses, 10) || 1),
        expiresInDays: parseInt(days, 10) || null,
      }),
    });
    setCreating(false);
    if (!res.ok) {
      toast.error("Could not create invite."); return;
    }
    toast.success("Invite created.");
    router.refresh();
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this invite?")) return;
    const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Revoked.");
      router.refresh();
    } else toast.error("Revoke failed.");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Role">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Role profile (optional)">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={roleProfileId} onChange={(e) => setRoleProfileId(e.target.value)}>
                <option value="">—</option>
                {roleProfiles.map((rp) => <option key={rp.id} value={rp.id}>{rp.name}</option>)}
              </select>
            </Field>
            <Field label="Max uses"><Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} /></Field>
            <Field label="Expires (days)"><Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} /></Field>
          </div>
          <Button onClick={create} disabled={creating}>{creating ? "Creating…" : "Create invite link"}</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Active invites</h2>
        {invites.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
        {invites.map((i) => (
          <Card key={i.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <Badge variant="outline">{i.role}</Badge>
              <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{i.link}</code>
              <span className="text-xs text-muted-foreground">{i.uses}/{i.maxUses} uses</span>
              {i.expiresAt && <span className="text-xs text-muted-foreground">expires {new Date(i.expiresAt).toLocaleDateString()}</span>}
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(i.link); toast.success("Copied."); }}><Copy className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => revoke(i.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
