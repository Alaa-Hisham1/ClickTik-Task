# ClickTik — Product Explorer

An Angular 21 product explorer built with DummyJSON. Users can authenticate, browse a paginated product catalog, search and filter by category, and add products to a cart.

## Running it

```bash
npm install
npm start        # ng serve — http://localhost:4200
npm test         # ng test
npm run build    # production build
```

For testing the login, DummyJSON provides test users such as `emilys` / `emilyspass`.

> Note: the login field is labeled "Email" to match the provided design, but DummyJSON authenticates using a username.

## Architecture

```text
src/app/
├── core/
│   └── auth/
│       ├── AuthService
│       ├── AuthStore
│       ├── AuthStorage
│       ├── auth-guard
│       └── auth-interceptor
│
├── features/
│   ├── auth/
│   │   └── login/
│   ├── products/
│   │   ├── product-page/
│   │   ├── interfaces/
│   │   ├── products.service.ts
│   │   └── products.store.ts
│   └── cart/
│       ├── interfaces/
│       ├── cart.service.ts
│       └── cart.store.ts
│
├── shared/
│   ├── ui/
│   │   ├── Button
│   │   ├── TextField
│   │   ├── Select
│   │   ├── ProductCard
│   │   ├── Pagination
│   │   ├── CartBadge
│   │   ├── LoadingSkeleton
│   │   ├── EmptyState
│   │   └── Logo
│   └── layout/
│       ├── Header
│       └── Footer
│
└── styles/
    ├── _tokens.scss
    └── _globals.scss
```

The application follows a feature-oriented structure. `cart` sits alongside `products` under
`features/` — it's its own vertical (service + store + interfaces), not a top-level concern.

Reusable components under `shared/ui` are kept presentational: they receive data through `input()`
and communicate through `output()` without directly depending on services or `HttpClient`.
Application state and API communication are handled by the corresponding feature stores and
services.

Both routes (`login`, `products`) are lazy-loaded via `loadComponent`, and `products` is protected
by a functional `CanActivateFn` guard.

## State Management

The application uses **NgRx Signal Store** for authentication, products, and cart state.

The main reasons for using Signal Store are:

* Signals provide simple reactive state for the UI.
* `rxMethod` works well for state-driven API requests.
* `patchState` keeps state updates centralized.
* `withComputed` is used for derived values such as loading state, authentication state, and total pages.
* Classic NgRx would add more ceremony than needed for the relatively small state requirements of this application.

The stores are:

* `AuthStore`
* `ProductsStore`
* `CartStore`

## Signals and RxJS

Signals are primarily used for application state, while RxJS is used for asynchronous streams and API operations.

For product loading, `rxMethod` and `switchMap` are used so that when the page, category, or search query changes, an older request can be cancelled in favor of the latest one.

Search input is debounced in the `Header` before updating the URL:

```ts
toObservable(searchQuery).pipe(
  debounceTime(400),
  distinctUntilChanged(),
  takeUntilDestroyed()
)
```

`linkedSignal` is used for the search field because the value needs to follow the URL while remaining locally writable while the user types.

The cart uses `concatMap` instead of `switchMap`. Since DummyJSON's cart endpoint does not persist cart state, the client maintains the accumulated cart lines and processes multiple additions in order.

The application also uses `takeUntilDestroyed()` for subscriptions, avoiding manual subscription cleanup.

## Cart

DummyJSON's `/carts/add` endpoint returns a calculated cart response but does not persist the cart on the server.

`CartStore` keeps the current cart lines in memory and uses an **optimistic update** when adding a product. The local cart state is updated immediately so the cart badge responds without waiting for the API request.

The current cart is then sent to DummyJSON with the complete cart list. If the request fails, the previous cart state is restored.

`concatMap` is used to keep multiple add-to-cart operations in order while maintaining the responsive optimistic UI.

Only the number of products in the cart is displayed, as required by the task.

## API and Authentication

The application uses:

```ts
provideHttpClient(withFetch())
```

Authentication is handled through a functional HTTP interceptor.

* The access token is attached to authenticated requests.
* Login and refresh requests are excluded from the authentication header.
* A `401` response triggers a token refresh and retries the original request.
* If refreshing fails, the session is cleared.
* `authGuard` protects the products route.
* The original URL is preserved through `returnUrl` so the user can return to the requested page after logging in.
* `AuthStorage` is responsible for browser storage.

## URL State

Pagination, category, and search are stored in the URL query parameters.

The router uses `withComponentInputBinding()` so these values can be consumed directly by the products page.

For example:

```text
/products?category=laptops&page=2
```

This makes product views shareable and keeps the state consistent when refreshing or navigating with the browser's back/forward buttons.

The URL drives the product store, so pagination, category selection, and search do not require separate duplicated state.

## Design System

The styling uses shared design tokens in `styles/_tokens.scss` for:

* Colors
* Spacing
* Border radius
* Typography
* Elevation

The primary teal color and other product-page colors are based on the provided Figma design.

Avenir Next is specified for the pagination numbers in the design. Since it is not available as a free web font, Open Sans is used as the fallback.

The provided cart and search assets are used from `public/images`, while other UI icons are implemented as inline SVGs using `currentColor`.

Category filters use real radio buttons with the specified two-tone appearance. Product counts are loaded from DummyJSON using lightweight requests and displayed beside the category names.

Category and search filters are mutually exclusive to match the API behavior and the provided design.

## Accessibility

The UI uses semantic HTML and accessible form controls, including:

* `nav` for navigation
* `fieldset` and `legend` for category filters
* `dl` for product metadata
* Visible focus states
* `aria-current` for active navigation items
* `role="status"` for loading and empty states
* Visually hidden labels where needed

## Performance

The product grid uses Angular's `@defer` to defer non-critical UI until the initial page content is ready.

A loading placeholder is provided through the `@placeholder` block so the layout remains stable while the deferred content is rendered.

## Project Notes

The implementation focuses on the required functionality and the provided Figma design while keeping the application structure reusable and maintainable.

The project also includes reusable components such as `Select`, `LoadingSkeleton`, and `EmptyState`.

## Disclaimer

This project was built as a technical assessment using DummyJSON, a public dummy API, and is intended for assessment purposes only.
