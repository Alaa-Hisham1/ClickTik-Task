// What CartStore sends on every add — DummyJSON's /carts/add doesn't persist
// anything server-side, so this list is the only real record of "what's in
// the cart" and has to be rebuilt and resent in full on each addition.
export interface CartProductLine {
  id: number;
  quantity: number;
}

// Matches DummyJSON's real /carts/add response (confirmed live) — only the
// fields this app actually reads (totalQuantity drives the badge count).
export interface Cart {
  id: number;
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}
