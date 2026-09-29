# Seed Medusa with the Wild Coral catalog

Creates the categories, tags, products, variants (color × size), prices and photos from
`catalog.ts` in your Medusa store. Needs Node 22.18 or newer (you have it).

## 1. Look before you leap (no login, sends nothing)

```powershell
npm run seed:dry -- --price=120
```

Shows every product and variant it would create, and checks all the photo files exist.

## 2. Set your prices

Open `scripts/seed/catalog.ts` and set `defaultPrice` (or a `price` per product). The script
refuses to run without one, because I don't know your prices. To track stock, set `stock` to a
number per variant; `null` means Medusa doesn't track stock (everything shows "in stock").

## 3. Run it for real

Your login stays in your own terminal window; it is never written to a file.

**Best: a Secret API key** (revocable, so delete it when you're done).
In the Medusa admin: Settings → Secret API Keys → Create. Then:

```powershell
$env:MEDUSA_ADMIN_API_KEY = "paste-the-key-here"
npm run seed
Remove-Item Env:MEDUSA_ADMIN_API_KEY
```

**Or your admin email and password:**

```powershell
$env:MEDUSA_ADMIN_EMAIL = "you@example.com"
$env:MEDUSA_ADMIN_PASSWORD = "your-password"
npm run seed
Remove-Item Env:MEDUSA_ADMIN_PASSWORD
```

The backend URL is read from the project's `.env` (`MEDUSA_BACKEND_URL`).

## Options

| Flag | Effect |
| --- | --- |
| `--price=120` | Use this EUR price for every product this run |
| `--stock=5` | Track stock and set 5 units per variant (needs a stock location) |
| `--only=rose-bikini,copper-chain-bikini` | Only these products (by handle) |
| `--dry-run` | Same as `npm run seed:dry` |

## Good to know

- **Safe to run again.** A product whose handle already exists is skipped; existing categories and
  tags are reused. To redo a product, delete it in the admin first.
- Products go into the **Default Sales Channel** (change `settings.salesChannel` if yours differs)
  and the default shipping profile.
- Missing categories are created. The catalog uses **Bikinis** and **One Pieces**; edit the
  `category` of each product if you'd rather use your existing ones.
- If you set stock, the script tells you when your stock location isn't linked to the sales channel
  (Settings → Locations & Shipping → the location → Sales channels). Stock won't show on the site
  until it is.
- `videos` in the catalog uploads video files and stores them in the product's metadata for the
  site to play. Uploading video through Medusa hasn't been tested; if it fails, the script says so
  and carries on.
- After it finishes, reload the site: products appear on `/shop` and the home page immediately.
