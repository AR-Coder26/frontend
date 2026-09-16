'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SingleImagePicker } from '@/components/admin/SingleImagePicker';
import { SocialIcon, SOCIAL_ICON_OPTIONS } from '@/lib/socialIcons';
import { createSocialMediaLink, updateSocialMediaLink } from '@/lib/api/socialLinks';
import { ApiError } from '@/lib/api/client';
import { socialLinkFormSchema, type SocialLinkFormValues } from '@/lib/validators/adminSocialLink';
import type { SocialMediaLink } from '@/types';

interface SocialLinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: SocialMediaLink | null;
  activeCountExcludingThis: number;
  maxActiveLinks: number;
  onSaved: (link: SocialMediaLink) => void;
}

export function SocialLinkFormDialog({
  open,
  onOpenChange,
  link,
  activeCountExcludingThis,
  maxActiveLinks,
  onSaved,
}: SocialLinkFormDialogProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SocialLinkFormValues>({ resolver: zodResolver(socialLinkFormSchema) });

  const watchedIconName = watch('iconName');

  const wouldExceedCapOnActivate = !link?.isActive && activeCountExcludingThis >= maxActiveLinks;

  useEffect(() => {
    if (open) {
      reset({
        platformName: link?.platformName ?? '',
        iconName: (link?.iconName as SocialLinkFormValues['iconName']) ?? 'facebook',
        targetUrl: link?.targetUrl ?? '',
        displayOrder: link?.displayOrder ?? 0,
        isActive: link?.isActive ?? true,
      });
      setLogoFile(null);
    }
  }, [open, link, reset]);

  async function onSubmit(values: SocialLinkFormValues) {
    if (values.isActive && wouldExceedCapOnActivate) {
      toast.error('Active link limit reached', {
        description: `You can only have ${maxActiveLinks} active social links at once. Deactivate another one first.`,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('platformName', values.platformName);
      formData.append('iconName', values.iconName);
      formData.append('targetUrl', values.targetUrl);
      formData.append('displayOrder', String(values.displayOrder));
      formData.append('isActive', String(values.isActive));
      if (logoFile) formData.append('logo', logoFile);

      const saved = link
        ? await updateSocialMediaLink(link._id, formData)
        : await createSocialMediaLink(formData);

      onSaved(saved);
      toast.success(link ? 'Social link updated' : 'Social link added');
      onOpenChange(false);
    } catch (error) {
      toast.error('Could not save social link', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  async function handleRemoveLogo() {
    if (!link?.logo?.url) return;
    try {
      const formData = new FormData();
      formData.append('removeLogo', 'true');
      const saved = await updateSocialMediaLink(link._id, formData);
      onSaved(saved);
      toast.success('Custom logo removed — showing the standard icon now');
    } catch (error) {
      toast.error('Could not remove logo', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              placeholder="e.g. Facebook, Instagram, X"
              {...register('platformName')}
              invalid={!!errors.platformName}
            />
            {errors.platformName && (
              <p className="mt-1 text-xs text-destructive">{errors.platformName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetUrl">Profile / Page URL</Label>
            <Input
              id="targetUrl"
              placeholder="https://facebook.com/yourpage"
              {...register('targetUrl')}
              invalid={!!errors.targetUrl}
            />
            {errors.targetUrl && <p className="mt-1 text-xs text-destructive">{errors.targetUrl.message}</p>}
          </div>

          <div>
            <Label htmlFor="iconName">Icon</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700">
                {watchedIconName && <SocialIcon name={watchedIconName} className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <Select id="iconName" {...register('iconName')} invalid={!!errors.iconName}>
                  {SOCIAL_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {errors.iconName && <p className="mt-1 text-xs text-destructive">{errors.iconName.message}</p>}
            <p className="mt-1 text-[11px] text-neutral-400">
              Or upload a custom logo below — a custom logo always overrides this standard icon.
            </p>
          </div>

          <div>
            <SingleImagePicker label="Custom Logo (optional)" existingImage={link?.logo ?? null} onChange={setLogoFile} />
            {link?.logo?.url && !logoFile && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="mt-2 text-xs text-neutral-500 underline underline-offset-2 hover:text-destructive"
              >
                Remove custom logo (revert to standard icon)
              </button>
            )}
          </div>

          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" step="1" {...register('displayOrder')} invalid={!!errors.displayOrder} />
            <p className="mt-1 text-[11px] text-neutral-400">Lower numbers show first in the Footer.</p>
          </div>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div>
                <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
                  <span className="text-sm text-neutral-700">Active (visible in Footer)</span>
                  <Switch
                    checked={field.value}
                    disabled={!field.value && wouldExceedCapOnActivate}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </div>
                {wouldExceedCapOnActivate && (
                  <p className="mt-1 text-xs text-amber-600">
                    {maxActiveLinks} active links already exist — turning this on will replace one only
                    after you deactivate another.
                  </p>
                )}
              </div>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : link ? 'Save Changes' : 'Add Social Link'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}