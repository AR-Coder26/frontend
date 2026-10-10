'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, KeyRound } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StaffFormDialog } from '@/components/admin/StaffFormDialog';
import { StaffPasswordDialog } from '@/components/admin/StaffPasswordDialog';
import { OwnerOnly } from '@/components/auth/OwnerOnly';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getStaff, updateStaff } from '@/lib/api/staff';
import { ApiError } from '@/lib/api/client';
import type { StaffMember } from '@/types';

function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<StaffMember | null>(null);
  const [toggleTarget, setToggleTarget] = useState<StaffMember | null>(null);

  useEffect(() => {
    getStaff()
      .then(setStaff)
      .catch((error) =>
        toast.error('Could not load staff', { description: error instanceof ApiError ? error.message : 'Please try again.' })
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggleActive() {
    if (!toggleTarget) return;
    try {
      const updated = await updateStaff(toggleTarget.id, { isActive: !toggleTarget.isActive });
      setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success(updated.isActive ? 'Account reactivated' : 'Account deactivated and signed out');
    } catch (error) {
      toast.error('Could not update account', { description: error instanceof ApiError ? error.message : 'Please try again.' });
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Staff"
        description="Employee accounts can manage orders and products, but never see cost, profit, analytics, settings or other staff."
        action={
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add staff
          </Button>
        }
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : staff.length === 0 ? (
        <div className="rounded-lg border border-dashed border-input bg-card p-10 text-center text-sm text-muted-foreground">
          No staff accounts yet. Staff accounts can only be created here.
        </div>
      ) : (
        <Table stackOnMobile>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell label="Name" className="font-medium text-foreground">{member.name}</TableCell>
                <TableCell label="Employee ID" className="font-mono text-xs">{member.employeeId}</TableCell>
                <TableCell label="Email" className="break-all text-muted-foreground">{member.email}</TableCell>
                <TableCell label="Status">
                  <Badge variant={member.isActive ? 'success' : 'outline'}>{member.isActive ? 'Active' : 'Deactivated'}</Badge>
                </TableCell>
                <TableCell label="Added" className="text-muted-foreground">{format(new Date(member.createdAt), 'dd MMM yyyy')}</TableCell>
                <TableCell label="" className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPasswordTarget(member)} className="flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" /> Password
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setToggleTarget(member)}>
                      {member.isActive ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <StaffFormDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(created) => setStaff((prev) => [created, ...prev])} />
      <StaffPasswordDialog staff={passwordTarget} onOpenChange={(open) => !open && setPasswordTarget(null)} />
      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={`${toggleTarget?.isActive ? 'Deactivate' : 'Reactivate'} ${toggleTarget?.name ?? ''}?`}
        description={
          toggleTarget?.isActive
            ? 'They are signed out everywhere immediately and cannot sign in until reactivated. Their history is kept.'
            : 'They will be able to sign in again with their current password.'
        }
        onConfirm={handleToggleActive}
      />
    </div>
  );
}

export default function AdminStaffPage() {
  return (
    <OwnerOnly>
      <StaffPage />
    </OwnerOnly>
  );
}
