import { request, adminRequest } from './client';
import type { Category } from '@/types';

// ---------- Public ----------

/** Active categories only, sorted by displayOrder then name. */
export function getCategories() {
  return request<Category[]>('/categories');
}

export function getCategoryBySlug(slug: string) {
  return request<Category>(`/categories/${slug}`);
}

// ---------- Admin ----------

/** Includes inactive categories, unlike the public endpoint above. */
export function getAdminCategories() {
  return adminRequest<Category[]>('/admin/categories');
}

export function getAdminCategoryById(id: string) {
  return adminRequest<Category>(`/admin/categories/${id}`);
}

/** multipart/form-data — fields: name, description, displayOrder, file field "image". */
export function createCategory(formData: FormData) {
  return adminRequest<Category>('/admin/categories', { method: 'POST', body: formData });
}

/** multipart/form-data — same fields as create, plus isActive. The "image" file is optional;
 *  omit it to keep the existing image. */
export function updateCategory(id: string, formData: FormData) {
  return adminRequest<Category>(`/admin/categories/${id}`, { method: 'PUT', body: formData });
}

/** Server returns 409 if any product still references this category — surface
 *  `error.message` directly to the admin, it already names the exact product count. */
export function deleteCategory(id: string) {
  return adminRequest<null>(`/admin/categories/${id}`, { method: 'DELETE' });
}