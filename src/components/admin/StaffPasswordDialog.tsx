'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { setStaffPassword } from '@/lib/api/staff';
import { ApiError } from '@/lib/api/client';
import { staffPasswordSchema, type StaffPasswordValues } from '@/lib/validators/adminStaff';
import type { StaffMember } from '@/types';

interface StaffPasswordDialogProps {
  staff: StaffMember | null;
  onOpenChange: (open: boolean) => void;
}

export function StaffPasswordDialog({ staff, onOpenChange }: StaffPasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffPasswordValues>({ resolver: zodResolver(staffPasswordSchema) });

  useEffect(() => {
    if (staff) reset({ password: '' });
  }, [staff, reset]);

  async function onSubmit(values: StaffPasswordValues) {
    if (!staff) return;
    try {
      await setStaffPassword(staff.id, values.password);
      toast.success('Password updated', { description: `${staff.name} must sign in again with the new password.` });
      onOpenChange(false);
    } catch (error) {
      toast.error('Could not update password', { description: error instanceof ApiError ? error.message : 'Please try again.' });
    }
  }

  return (
    <Dialog open={staff !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set a new password{staff ? ` for ${staff.name}` : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate autoComplete="off">
          <div>
            <Label htmlFor="staff-new-password">New password</Label>
            <Input id="staff-new-password" type="text" {...register('password')} invalid={!!errors.password} autoComplete="new-password" />
            {errors.password ? (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Signs the employee out on every device.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Update password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
