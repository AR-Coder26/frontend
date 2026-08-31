'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CategoryFormDialog } from '@/components/admin/CategoryFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getAdminCategories, deleteCategory } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function loadCategories() {
    setIsLoading(true);
    try {
      // Admin endpoint intentionally includes inactive categories too, unlike the public one.
      const result = await getAdminCategories();
      setCategories(result);
    } catch (error) {
      toast.error('Could not load categories', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleSaved(saved: Category) {
    setCategories((prev) => {
      const exists = prev.some((c) => c._id === saved._id);
      return exists ? prev.map((c) => (c._id === saved._id ? saved : c)) : [...prev, saved];
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      // Server returns 409 (surfaced via ApiError.message) if any product still references
      // this category — that message already names the exact product count, so it's shown
      // as-is rather than a generic failure message.
      await deleteCategory(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Could not delete category', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
      throw error; // ConfirmDialog catches this itself and stays open — see its doc comment
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Manage the categories customers filter and browse by."
        action={
          <Button
            onClick={() => {
              setEditingCategory(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          No categories yet. Add your first one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-neutral-100">
                    {category.image?.url ? (
                      <Image src={category.image.url} alt={category.name} width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-neutral-300" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-neutral-900">{category.name}</TableCell>
                <TableCell className="text-neutral-500">{category.slug}</TableCell>
                <TableCell className="text-neutral-500">{category.displayOrder}</TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? 'success' : 'outline'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(category);
                        setDialogOpen(true);
                      }}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                      aria-label="Edit category"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(category)}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete category"
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

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} onSaved={handleSaved} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone. If any products still use this category, the server will block the deletion."
        onConfirm={handleDelete}
      />
    </div>
  );
}
