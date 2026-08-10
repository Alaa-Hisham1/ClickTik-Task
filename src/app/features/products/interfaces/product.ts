// Matches DummyJSON's real /products response (confirmed live) — only the
// fields this app actually renders, not the full schema (dimensions,
// warranty text, meta, etc. are real fields too, just unused here).
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string; // not every category has one (e.g. groceries)
  thumbnail: string;
  reviews: unknown[]; // only .length is used, for a real review count
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}
