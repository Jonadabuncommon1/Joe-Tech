/**
 * One buyable option of a product that carries its own price, e.g. a
 * storage size ("64GB", "128GB", "256GB") for a phone that would otherwise
 * need a separate listing per capacity. Selecting one on the product page
 * swaps in its price the way Jumia/Temu do for phones and tablets.
 */
export interface ProductVariant {
  /** Whatever the admin types, e.g. "64GB", "128GB", "1TB". */
  label: string;
  price: number;
  /** Strikethrough price for this specific variant, if it's discounted. */
  originalPrice?: number;
  /** Same convention as Product.inStock: unset/true means available. */
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  colors?: string[];
  sizes?: string[];
  /** Storage/size/etc. options, each with its own price. When present, the
   *  product page shows a picker instead of the flat `price` above. */
  variants?: ProductVariant[];
  images: string[];
  isNew?: boolean;
  isTrending?: boolean;
  location?: string;
  year?: string;
  mileage?: string;
  created_at?: string;

  /** Lucide icon name used for the generated placeholder when `images` is empty. */
  icon?: string;
  /** Short spec bullets shown on the product card and detail page. */
  specs?: string[];
  /** Condition badge, e.g. "Brand New", "UK Used". */
  condition?: string;
  /** Services are quoted "from" a starting price rather than sold at a fixed one. */
  isService?: boolean;
  /** false hides the buy actions and shows an Out of Stock badge everywhere the
   *  product appears; unset/true means available, so existing rows default in. */
  inStock?: boolean;
  /** Strikethrough price shown next to the current price when discounted. */
  originalPrice?: number;
  /** Surfaces the product in the homepage Hot Deals rail. */
  isHot?: boolean;
  /** Surfaces the product in the homepage Featured grid. */
  isFeatured?: boolean;
  /** Small custom promo tag, e.g. "-25% OFF", set from the admin upload form. */
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  /** Short label used in navigation and chips. */
  shortName: string;
  description: string;
  icon: string;
  /** Tailwind gradient stops for the category card. */
  gradient: string;
  /** Service categories route to the services page instead of a product grid. */
  isService?: boolean;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  /** Which variant (e.g. storage size) was chosen; its price overrides
   *  product.price wherever cart totals are computed. */
  selectedVariant?: ProductVariant;
}

export type ViewState =
  | 'home'
  | 'shop'
  | 'categories'
  | 'category'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'about'
  | 'contact'
  | 'services'
  | 'admin'
  | 'terms'
  | 'privacy'
  | 'auth';

/** A repair/maintenance booking submitted from the services page. */
export interface RepairRequest {
  fullName: string;
  phone: string;
  email: string;
  deviceType: string;
  deviceModel: string;
  faultDescription: string;
  branch: string;
  serviceMode: 'drop-off' | 'pickup';
  preferredDate: string;
  urgency: 'standard' | 'express';
  photos: File[];
}
