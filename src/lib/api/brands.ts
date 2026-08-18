import { request, adminRequest } from './client';
import type { Brand } from '@/types';

// ---------- Public ----------

export function getBrands() {
  return request<Brand[]>('/brands');
}

export function getBrandBySlug(slug: string) {
  return request<Brand>(`/brands/${slug}`);
}

// ---------- Admin ----------

export function getAdminBrands() {
  return adminRequest<Brand[]>('/admin/brands');
}

export function getAdminBrandById(id: string) {
  return adminRequest<Brand>(`/admin/brands/${id}`);
}

/** multipart/form-data — fields: name, file field "logo" (NOT "image" — differs from
 *  categories, matches the backend's upload.single('logo') exactly). */
export function createBrand(formData: FormData) {
  return adminRequest<Brand>('/admin/brands', { method: 'POST', body: formData });
}

export function updateBrand(id: string, formData: FormData) {
  return adminRequest<Brand>(`/admin/brands/${id}`, { method: 'PUT', body: formData });
}

/** Server returns 409 if any product still references this brand. */
export function deleteBrand(id: string) {
  return adminRequest<null>(`/admin/brands/${id}`, { method: 'DELETE' });
}