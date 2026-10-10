'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createStaff } from '@/lib/api/staff';
import { ApiError } from '@/lib/api/client';
import { staffCreateSchema, type StaffCreateValues } from '@/lib/validators/adminStaff';
import type { StaffMember } from '@/types';

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (staff: StaffMember) => void;
}

/** Creates an employee account. The owner chooses the password and shares it with the employee. */
export function StaffFormDialog({ open, onOpenChange, onCreated }: StaffFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffCreateValues>({ resolver: zodResolver(staffCreateSchema) });

  useEffect(() => {
    if (open) reset({ name: '', email: '', employeeId: '', password: '' });
  }, [open, reset]);

  async function onSubmit(values: StaffCreateValues) {
    try {
      const created = await createStaff(values);
      toast.success('Staff account created', { description: `${created.name} can now sign in at the admin login.` });
      onCreated(created);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Please try again.';
      if (error instanceof ApiError && error.statusCode === 409) {
        setError(/employee id/i.test(message) ? 'employeeId' : 'email', { message });
      } else if (error instanceof ApiError && error.statusCode === 400 && /email/i.test(message)) {
        setError('email', { message });
      } else {
        toast.error('Could not create staff account', { description: message });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add staff member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate autoComplete="off">
          <div>
            <Label htmlFor="staff-name">Employee name</Label>
            <Input id="staff-name" {...register('name')} invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="staff-id">Employee ID</Label>
            <Input id="staff-id" {...register('employeeId')} invalid={!!errors.employeeId} placeholder="EMP-001" />
            {errors.employeeId && <p className="mt-1 text-xs text-destructive">{errors.employeeId.message}</p>}
          </div>
          <div>
            <Label htmlFor="staff-email">Email</Label>
            <Input id="staff-email" type="email" {...register('email')} invalid={!!errors.email} autoComplete="off" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="staff-password">Password (you assign it)</Label>
            <Input id="staff-password" type="text" {...register('password')} invalid={!!errors.password} autoComplete="new-password" />
            {errors.password ? (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">8+ characters with a letter and a number. Share it with the employee privately.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
