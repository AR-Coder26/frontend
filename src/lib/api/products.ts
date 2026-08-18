import { request, adminRequest, buildQueryString } from "./client";
import type {
  FabricStatus,
  FabricType,
  Paginated,
  Product,
  Size,
} from "@/types";

// ---------- Public ----------

export interface ProductListParams {
  [key: string]: unknown;
  /** Category SLUG, not id. */
  category?: string;
  /** Brand SLUG, not id. */
  brand?: string;
  fabricType?: FabricType;
  fabricStatus?: FabricStatus;
  size?: Size;
  /** Minimum discount %, e.g. 30 for the site's "30% OFF" filter view. */
  discount?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "newest" | "oldest";
  page?: number;
  /** Server caps this at 50 regardless of what's sent. */
  limit?: number;
}

export function getProducts(params: ProductListParams = {}) {
  return request<Paginated<"products", Product>>(
    `/products${buildQueryString(params)}`,
  );
}

export function getProductBySlug(slug: string) {
  return request<Product>(`/products/${slug}`);
}

// ---------- Admin ----------

export interface AdminProductListParams {
  [key: string]: unknown;
  search?: string;
  /** Category id, unlike the public endpoint's slug. */
  category?: string;
  /** Brand id, unlike the public endpoint's slug. */
  brand?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function getAdminProducts(params: AdminProductListParams = {}) {
  return adminRequest<Paginated<"products", Product>>(
    `/admin/products${buildQueryString(params)}`,
  );
}

export function getAdminProductById(id: string) {
  return adminRequest<Product>(`/admin/products/${id}`);
}

/**
 * multipart/form-data — fields: name, description, category (id), brand (id), fabricType,
 * pieceCount, isCustomStitchingAvailable, discountPercentage, variants (a JSON STRING —
 * `JSON.stringify(variantsArray)`, not nested form fields), file field "images" (up to 8).
 * Per-variant images are NOT uploaded here — call addVariantImages() after creation.
 */
export function createProduct(formData: FormData) {
  return adminRequest<Product>("/admin/products", {
    method: "POST",
    body: formData,
  });
}

/**
 * Plain JSON, no files. `variants[]` items that include their existing `_id` keep their
 * images untouched; items with NO `_id` are treated as brand-new variants (start with no
 * images — use addVariantImages() for those afterwards).
 */
export function updateProduct(id: string, payload: Record<string, unknown>) {
  return adminRequest<Product>(`/admin/products/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteProduct(id: string) {
  return adminRequest<null>(`/admin/products/${id}`, { method: "DELETE" });
}

/** multipart/form-data — file field "images" (up to 8). Appends to the product's gallery. */
export function addProductImages(id: string, formData: FormData) {
  return adminRequest<Product>(`/admin/products/${id}/images`, {
    method: "POST",
    body: formData,
  });
}

export function deleteProductImage(id: string, publicId: string) {
  return adminRequest<Product>(
    `/admin/products/${id}/images${buildQueryString({ publicId })}`,
    { method: "DELETE" },
  );
}

/** multipart/form-data — file field "images" (up to 6, per variant). */
export function addVariantImages(
  id: string,
  variantId: string,
  formData: FormData,
) {
  return adminRequest<Product>(
    `/admin/products/${id}/variants/${variantId}/images`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export function deleteVariantImage(
  id: string,
  variantId: string,
  publicId: string,
) {
  return adminRequest<Product>(
    `/admin/products/${id}/variants/${variantId}/images${buildQueryString({ publicId })}`,
    { method: "DELETE" },
  );
}
