'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImageIcon, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getAdminProducts, deleteProduct } from '@/lib/api/products';
import { getAdminCategories } from '@/lib/api/categories';
import { getAdminBrands } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { formatPKR } from '@/lib/utils';
import type { Product, Category, Brand } from '@/types';

const PAGE_LIMIT = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'true' | 'false'>('');

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminBrands()])
      .then(([cats, brs]) => {
        setCategories(cats);
        setBrands(brs);
      })
      .catch(() => {
        // Non-fatal — the page still works with empty filter dropdowns if this fails.
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getAdminProducts({
      page,
      limit: PAGE_LIMIT,
      search: search || undefined,
      category: categoryFilter || undefined,
      brand: brandFilter || undefined,
      isActive: statusFilter === '' ? undefined : statusFilter === 'true',
    })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error('Could not load products', {
          description: error instanceof ApiError ? error.message : 'Please try again.',
        });
      })
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, search, categoryFilter, brandFilter, statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      // Server-side this also deletes every Cloudinary image (general + all variants) — see
      // backend PROJECT_STATE §6's DELETE /admin/products/:id note.
      await deleteProduct(deleteTarget._id);
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setTotal((prev) => prev - 1);
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Could not delete product', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
      throw error;
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${total} product${total === 1 ? '' : 's'} in your catalog.`}
        action={
          <Button asChild className="flex items-center gap-1.5">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex min-w-[220px] flex-1 items-center gap-2">
          <Input
            placeholder="Search by name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" variant="outline" className="shrink-0">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>

        <Select
          value={categoryFilter}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value);
          }}
          className="h-9 w-auto min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>

        <Select
          value={brandFilter}
          onChange={(e) => {
            setPage(1);
            setBrandFilter(e.target.value);
          }}
          className="h-9 w-auto min-w-[140px]"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as '' | 'true' | 'false');
          }}
          className="h-9 w-auto min-w-[120px]"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          No products match these filters.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const thumb = product.images.find((img) => img.url) ?? product.variants.find((v) => v.images.some((i) => i.url))?.images.find((i) => i.url);
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-neutral-100">
                        {thumb?.url ? (
                          <Image src={thumb.url} alt={product.name} width={40} height={40} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-neutral-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium text-neutral-900">{product.name}</TableCell>
                    <TableCell className="text-neutral-500">{product.category?.name ?? '—'}</TableCell>
                    {/* brand is nullable at read time even though required at write time — see types/index.ts */}
                    <TableCell className="text-neutral-500">{product.brand?.name ?? '—'}</TableCell>
                    <TableCell className="text-neutral-500">
                      {product.minPrice === product.maxPrice
                        ? formatPKR(product.minPrice)
                        : `${formatPKR(product.minPrice)} – ${formatPKR(product.maxPrice)}`}
                    </TableCell>
                    <TableCell>
                      {product.isOutOfStock ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : product.totalStock <= 5 ? (
                        <Badge variant="warning">{product.totalStock} left</Badge>
                      ) : (
                        <span className="text-neutral-500">{product.totalStock}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'success' : 'outline'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          aria-label="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This permanently deletes the product and all of its images. This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
