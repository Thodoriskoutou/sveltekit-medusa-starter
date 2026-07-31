# sveltekit-medusa-starter

A minimal [SvelteKit](https://svelte.dev/docs/kit) storefront for [Medusa v2](https://medusajs.com), built on [`sveltekit-medusa-sdk`](https://www.npmjs.com/package/sveltekit-medusa-sdk) and the [`sveltekit-medusa-ui`](https://pevey.com/sveltekit-medusa-ui) component registry.

Fork or clone it as the starting point for your own store. It is deliberately small — enough to show the full path from browsing to a completed order, and not much else.

> Looking for the Medusa v1 version? It is on the [`v1`](https://github.com/pevey/sveltekit-medusa-starter/tree/v1) branch.

## What's included

| Route                | What it does                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `/`                  | Category grid                                                     |
| `/category/[slug]`   | Paginated product listing for a category                          |
| `/collection/[slug]` | Paginated product listing for a collection                        |
| `/product/[slug]`    | Gallery, variant options, quantity, add to cart, JSON-LD          |
| `/search`            | Full-page search (requires `medusa-plugin-search`)                |
| `/checkout`          | Stripe checkout — address, shipping, payment                      |
| `/checkout/return`   | Stripe redirect target; completes the order                       |
| `/account`           | Profile and order history, sign in / out                          |

Cart lives in a drawer in the navbar, and sign-in is a dialog driven by `?auth=login`, so neither needs its own route.

## Requirements

- Node 20+
- A running Medusa v2 server with a publishable API key
- Optional: [`medusa-plugin-search`](https://pevey.com/medusa-plugin-search) for `/search`
- Optional: a Stripe account, and the Stripe provider enabled on your Medusa region, for `/checkout`

## Quick start

```bash
git clone https://github.com/pevey/sveltekit-medusa-starter my-store
cd my-store
npm install
cp .env.example .env   # then fill in MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY
npm run dev
```

## Environment variables

SvelteKit 3 replaced `$env/*` with explicit environment variables, so every var is declared and validated in [`src/env.ts`](src/env.ts). There is no `PUBLIC_` prefix — a var is public because it is marked `public: true` there. Private vars are imported from `$app/env/private`, public ones from `$app/env/public`.

Adding a new variable means adding it to `src/env.ts` as well as your `.env`.

| Variable                      | Required | Notes                                                    |
| ----------------------------- | -------- | -------------------------------------------------------- |
| `MEDUSA_BACKEND_URL`          | yes      | e.g. `http://localhost:9000`                             |
| `MEDUSA_PUBLISHABLE_KEY`      | yes      | Medusa admin → Settings → Publishable API keys           |
| `MEDUSA_DEFAULT_REGION_ID`    | no       | Pin a region instead of resolving one per visitor        |
| `MEDUSA_DEFAULT_COUNTRY_CODE` | no       | Used to pick the default region                          |
| `STRIPE_KEY`                  | no       | `pk_...`; `/checkout` shows a placeholder without it     |
| `STRIPE_REDIRECT_URL`         | no       | Absolute URL of your `/checkout/return` route            |
| `SITE_NAME`, `SITE_URL`       | no       | Used in the navbar, `<title>`, and Open Graph tags       |

The two Medusa vars are validated at boot — the app will refuse to start without them.

## Project layout

```
src/
├─ env.ts                  environment variable declarations
├─ hooks.server.ts         createMedusaHandle — the only Medusa config
├─ app.d.ts                App.Locals.medusa
├─ routes/
│  ├─ layout.css           Tailwind v4 entry + shadcn design tokens
│  ├─ +layout.svelte       ModeWatcher, MetaProvider, Navbar, Footer, Auth.Dialog
│  └─ …                    the pages listed above
└─ lib/
   ├─ utils.ts             cn() and shadcn helper types
   └─ components/
      ├─ Navbar.svelte     logo, search, theme, account, cart — yours to edit
      ├─ Footer.svelte     placeholder
      └─ ui/               registry components (see below)
```

`src/lib/components/ui/` holds **your copies** of registry components. They were installed by the shadcn-svelte CLI and are not a dependency — edit them freely. Nothing updates them behind your back.

## Data loading

There are no `+page.server.ts` load functions. The SDK exports [remote functions](https://svelte.dev/docs/kit/remote-functions) that components call directly:

```svelte
const product = $derived(await getProduct({ slug: page.params.slug }))
```

This works because `compilerOptions.experimental.async` and `kit.experimental.remoteFunctions` are enabled in [`vite.config.ts`](vite.config.ts). Wrap awaited data in `<svelte:boundary>` to control the loading and error states — every page here does.

`src/hooks.server.ts` configures the client once. Session, cart, region, and country resolution are handled by the SDK; see its docs for cookie names and other options.

## Adding more components

The registry has more than is installed here — FAQ accordions, review widgets, Braintree checkout, address autocomplete, alternate theme switchers, and so on:

```bash
npx shadcn-svelte@latest add https://pevey.com/r/faq.json
```

Browse the full list at [pevey.com/r/index.json](https://pevey.com/r/index.json).

Two notes:

- Run `npx svelte-kit sync` first if you have just run an install. Package managers prune the `node_modules/$app` directory that SvelteKit generates, and the CLI needs it to resolve `$app/tsconfig`.
- The `checkout` item ships Stripe **and** Braintree bodies together, which is why `sveltekit-braintree` is a dependency. Using only Stripe? Delete the `checkout-braintree-*.svelte` and `checkout-auto*.svelte` files, drop their exports from `src/lib/components/ui/checkout/index.ts`, and uninstall the package.

## Deployment

The app uses `@sveltejs/adapter-auto`, which detects a handful of hosts. For anything else, swap it in `vite.config.ts` for the adapter you need — `adapter-node`, `adapter-cloudflare`, `adapter-vercel`, etc.

## License

MIT
