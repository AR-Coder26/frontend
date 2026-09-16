// frontend/src/app/(admin)/admin/(protected)/social-links/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SocialLinkFormDialog } from '@/components/admin/SocialLinkFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SocialIcon } from '@/lib/socialIcons';
import { getAdminSocialLinks, deleteSocialMediaLink, reorderSocialMediaLinks } from '@/lib/api/socialLinks';
import { ApiError } from '@/lib/api/client';
import type { SocialMediaLink } from '@/types';

// Mirrors backend/src/models/SocialMediaLink.model.js's MAX_ACTIVE_SOCIAL_LINKS. Kept as a
// local constant (not fetched from the API) since it's a fixed product decision tied to the
// Footer's layout, not runtime configuration — the backend independently enforces the real
// limit regardless of what this page shows, this is purely for the warning banner and the
// dialog's client-side hint.
const MAX_ACTIVE_LINKS = 6;

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialMediaLink | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const activeCount = links.filter((link) => link.isActive).length;
  const isAtCap = activeCount >= MAX_ACTIVE_LINKS;

  async function loadLinks() {
    setIsLoading(true);
    try {
      const result = await getAdminSocialLinks();
      setLinks(result);
    } catch (error) {
      toast.error('Could not load social links', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  function handleSaved(saved: SocialMediaLink) {
    setLinks((prev) => {
      const exists = prev.some((link) => link._id === saved._id);
      const next = exists ? prev.map((link) => (link._id === saved._id ? saved : link)) : [...prev, saved];
      return [...next].sort((a, b) => a.displayOrder - b.displayOrder);
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSocialMediaLink(deleteTarget._id);
      setLinks((prev) => prev.filter((link) => link._id !== deleteTarget._id));
      toast.success('Social link deleted');
    } catch (error) {
      toast.error('Could not delete social link', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
      throw error; // ConfirmDialog catches this itself and stays open — see its doc comment
    }
  }

  // No drag-and-drop library is installed in this project (see OtpInput.tsx's comment on the
  // same "avoid a new npm dependency before the next Vercel deploy" reasoning) — simple move
  // up/down buttons cover the "re-order display position" requirement without one.
  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= links.length || reorderingId !== null) return;

    const reordered = [...links];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const previousLinks = links; // for rollback if the request fails
    setLinks(reordered); // optimistic update so the row visibly moves immediately
    setReorderingId(moved._id);

    try {
      // Recompute clean, sequential displayOrder values (0..n-1) for the WHOLE list rather
      // than just the two swapped rows — this also self-heals any pre-existing gaps or
      // duplicate displayOrder values (e.g. from a manual DB edit).
      const order = reordered.map((link, i) => ({ id: link._id, displayOrder: i }));
      const updated = await reorderSocialMediaLinks(order);
      setLinks(updated);
    } catch (error) {
      setLinks(previousLinks); // revert the optimistic move
      toast.error('Could not reorder', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setReorderingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Social Media Links"
        description="Manage the follow-us icons shown in the storefront Footer."
        action={
          <Button
            onClick={() => {
              setEditingLink(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Social Link
          </Button>
        }
      />

      {/* Requirement 2e: a visually clear warning once the 6-link threshold is reached. */}
      <div
        className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-2.5 text-sm ${
          isAtCap ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
        }`}
      >
        <span>
          <strong>{activeCount}</strong> / {MAX_ACTIVE_LINKS} active links
        </span>
        {isAtCap && <span className="font-medium">Limit reached — deactivate one to activate another.</span>}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading social links…</div>
      ) : links.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          No social links yet. Add your first one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link, index) => (
              <TableRow key={link._id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || reorderingId !== null}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === links.length - 1 || reorderingId !== null}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-neutral-100 text-neutral-600">
                    {link.logo?.url ? (
                      <Image
                        src={link.logo.url}
                        alt={link.platformName}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <SocialIcon name={link.iconName} className="h-4 w-4" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-neutral-900">{link.platformName}</TableCell>
                <TableCell className="max-w-[240px] truncate text-neutral-500">
                  <a href={link.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {link.targetUrl}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={link.isActive ? 'success' : 'outline'}>{link.isActive ? 'Active' : 'Inactive'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLink(link);
                        setDialogOpen(true);
                      }}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                      aria-label="Edit social link"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(link)}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete social link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SocialLinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={editingLink}
        // How many OTHER active links exist, excluding the one being edited (if any) — see
        // SocialLinkFormDialog.tsx's prop comment for why this matters for the cap check.
        activeCountExcludingThis={editingLink ? activeCount - (editingLink.isActive ? 1 : 0) : activeCount}
        maxActiveLinks={MAX_ACTIVE_LINKS}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.platformName}"?`}
        description="This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}