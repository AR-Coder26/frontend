import { request, adminRequest } from './client';
import type { SocialMediaLink } from '@/types';

// ---------- Public ----------

export function getSocialLinks() {
  return request<SocialMediaLink[]>('/social-links');
}

// ---------- Admin ----------

export function getAdminSocialLinks() {
  return adminRequest<SocialMediaLink[]>('/admin/social-links');
}

export function getAdminSocialLinkById(id: string) {
  return adminRequest<SocialMediaLink>(`/admin/social-links/${id}`);
}

export function createSocialMediaLink(formData: FormData) {
  return adminRequest<SocialMediaLink>('/admin/social-links', { method: 'POST', body: formData });
}

export function updateSocialMediaLink(id: string, formData: FormData) {
  return adminRequest<SocialMediaLink>(`/admin/social-links/${id}`, { method: 'PUT', body: formData });
}

export function deleteSocialMediaLink(id: string) {
  return adminRequest<null>(`/admin/social-links/${id}`, { method: 'DELETE' });
}

export function reorderSocialMediaLinks(order: { id: string; displayOrder: number }[]) {
  return adminRequest<SocialMediaLink[]>('/admin/social-links/reorder', {
    method: 'PATCH',
    body: { order },
  });
}