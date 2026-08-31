'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BrandFormDialog } from '@/components/admin/BrandFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getAdminBrands, deleteBrand } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import type { Brand } from '@/types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  async function loadBrands() {
    setIsLoading(true);
    try {
      const result = await getAdminBrands();
      setBrands(result);
    } catch (error) {
      toast.error('Could not load brands', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  function handleSaved(saved: Brand) {
    setBrands((prev) => {
      const exists = prev.some((b) => b._id === saved._id);
      return exists ? prev.map((b) => (b._id === saved._id ? saved : b)) : [...prev, saved];
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      // Same 409-on-conflict pattern as categories — see backend PROJECT_STATE §4's
      // "never merged" note; the conflict message already names the referencing products.
      await deleteBrand(deleteTarget._id);
      setBrands((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      toast.success('Brand deleted');
    } catch (error) {
      toast.error('Could not delete brand', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
      throw error;
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Brands"
        description="Manage the brands customers filter and browse by."
        action={
          <Button
            onClick={() => {
              setEditingBrand(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading brands…</div>
      ) : brands.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          No brands yet. Add your first one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand._id}>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-neutral-100">
                    {brand.logo?.url ? (
                      <Image src={brand.logo.url} alt={brand.name} width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-neutral-300" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-neutral-900">{brand.name}</TableCell>
                <TableCell className="text-neutral-500">{brand.slug}</TableCell>
                <TableCell>
                  <Badge variant={brand.isActive ? 'success' : 'outline'}>{brand.isActive ? 'Active' : 'Inactive'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrand(brand);
                        setDialogOpen(true);
                      }}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                      aria-label="Edit brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(brand)}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete brand"
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

      <BrandFormDialog open={dialogOpen} onOpenChange={setDialogOpen} brand={editingBrand} onSaved={handleSaved} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone. If any products still use this brand, the server will block the deletion."
        onConfirm={handleDelete}
      />
    </div>
  );
}
