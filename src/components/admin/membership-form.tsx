"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ROLES = ["LEARNER", "AUTHOR", "INSTRUCTOR", "MANAGER", "ADMIN", "OWNER"] as const;

export function MembershipForm({
  membership,
  roleProfiles,
  managers,
}: {
  membership: { id: string; role: string; managerId: string | null; roleProfileId: string | null };
  roleProfiles: { id: string; name: string }[];
  managers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [role, setRole] = useState(membership.role);
  const [managerId, setManagerId] = useState(membership.managerId ?? "");
  const [roleProfileId, setRoleProfileId] = useState(membership.roleProfileId ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/memberships/${membership.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        managerId: managerId || null,
        roleProfileId: roleProfileId || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Update failed."); return;
    }
    toast.success("Updated.");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Remove this person from the workspace? Their evidence and history are preserved.")) return;
    const res = await fetch(`/api/admin/memberships/${membership.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Removed.");
      router.push("/workspace/people");
      router.refresh();
    } else toast.error("Remove failed.");
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="text-sm font-semibold">Membership</div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Role">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Manager">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
              <option value="">— none —</option>
              {managers.map((mg) => <option key={mg.id} value={mg.id}>{mg.name}</option>)}
            </select>
          </Field>
          <Field label="Role profile">
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={roleProfileId} onChange={(e) => setRoleProfileId(e.target.value)}>
              <option value="">— none —</option>
              {roleProfiles.map((rp) => <option key={rp.id} value={rp.id}>{rp.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          <Button variant="ghost" onClick={remove} className="text-destructive">Remove from workspace</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
