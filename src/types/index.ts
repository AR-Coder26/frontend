// ---------- Shared primitives ----------

export interface ImageAsset {
  url: string;
  publicId: string;
}

export type Size = 'S' | 'M' | 'L' | 'XL';
export type FabricStatus = 'stitched' | 'unstitched';
export type FabricType =
  | 'Lawn'
  | 'Cotton'
  | 'Khaddar'
  | 'Chiffon'
  | 'Silk'
  | 'Georgette'
  | 'Linen'
  | 'Other';
export type PieceCount = 1 | 2 | 3;
export type PaymentMethod = 'COD' | 'JazzCash' | 'EasyPaisa' | 'BankTransfer';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type AdminRole = 'admin' | 'staff';

/**
 * Generic shape for every paginated list endpoint. The backend does NOT use a consistent
 * `items` key — it names the array after the resource (`products`, `orders`, ...) — so `K`
 * pins down that exact key per-endpoint instead of guessing a generic one.
 * e.g. `Paginated<'products', Product>` -> { products: Product[]; total; page; totalPages }
 */
export type Paginated<K extends string, T> = {
  total: number;
  page: number;
  totalPages: number;
} & Record<K, T[]>;

// ---------- Category / Brand ----------

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  image: ImageAsset | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: ImageAsset | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Product ----------

export interface ProductVariant {
  _id: string;
  sku: string;
  color: string;
  size: Size;
  fabricStatus: FabricStatus;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: ImageAsset[];
}

/** Populated ref shape — only these 3 fields are ever selected on category/brand refs. */
export interface ProductRelationRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductRelationRef;
  brand: ProductRelationRef;
  fabricType: FabricType;
  pieceCount: PieceCount;
  isCustomStitchingAvailable: boolean;
  discountPercentage: number;
  images: ImageAsset[];
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtuals — manually reattached by attachComputedFields() on every .lean() query
  // (see product.controller.js), so they're ALWAYS present, never optional.
  totalStock: number;
  isOutOfStock: boolean;
  minPrice: number;
  maxPrice: number;
}

// ---------- Customer / Address ----------

export interface Address {
  _id: string;
  label?: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

/** POST /api/auth/register and POST /api/auth/login response — deliberately has NO
 *  `addresses` field, unlike the full Customer type below (only GET /api/auth/me returns it). */
export interface CustomerAuthSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Customer extends CustomerAuthSummary {
  addresses: Address[];
}

// ---------- Admin user ----------

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

// ---------- Order ----------

export interface OrderItem {
  product: string;
  variantSku: string;
  productName: string;
  color: string;
  size: Size;
  fabricStatus: FabricStatus;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  whatsappNumber: string;
  email: string | null;
}

export interface ShippingAddress {
  addressLine: string;
  city: string;
  postalCode: string | null;
}

export interface OrderPricing {
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerAccount: string | null;
  customer: OrderCustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  isFreeDelivery: boolean;
  paymentMethod: PaymentMethod;
  paymentProof: ImageAsset | null;
  orderStatus: OrderStatus;
  cancelReason: string | null;
  cancelledAt: string | null;
  adminNotes: string | null;
  isSeenByAdmin: boolean;
  firstMessageSent: boolean;
  firstMessageProof: ImageAsset | null;
  createdAt: string;
  updatedAt: string;
  // Virtual, always present.
  canBeCancelled: boolean;
  // Computed on every read, never stored — never send this back to the server.
  whatsappLink: string;
}

// ---------- Store settings ----------

export interface PublicWalletAccount {
  accountTitle: string;
  accountNumber: string;
  instructions: string | null;
}

export interface PublicBankAccount {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string | null;
  instructions: string | null;
}

/** GET /api/store-settings — an inactive method is `null`, in full, never partially masked. */
export interface StoreSettingsPublic {
  jazzCash: PublicWalletAccount | null;
  easyPaisa: PublicWalletAccount | null;
  bankTransfer: PublicBankAccount | null;
  minOrderValue: number;
  deliveryFlatRateNonKarachi: number;
}

export interface AdminWalletAccount extends PublicWalletAccount {
  isActive: boolean;
}

export interface AdminBankAccount extends PublicBankAccount {
  isActive: boolean;
}

/** GET/PATCH /api/admin/store-settings — full singleton document, includes every isActive flag. */
export interface StoreSettingsAdmin {
  _id: string;
  jazzCash: AdminWalletAccount;
  easyPaisa: AdminWalletAccount;
  bankTransfer: AdminBankAccount;
  minOrderValue: number;
  deliveryFlatRateNonKarachi: number;
  createdAt: string;
  updatedAt: string;
}