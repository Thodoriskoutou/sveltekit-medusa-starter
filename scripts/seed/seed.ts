/**
 * Seeds your Medusa store with the catalog in ./catalog.ts:
 * categories, tags, photos (uploaded from static/photos), products, variants, prices and,
 * optionally, stock.
 *
 *   npm run seed:dry     # checks the catalog and shows the plan — needs no login, sends nothing
 *   npm run seed         # does it for real (see README.md for how to provide your login)
 *
 * Safe to re-run: a product whose handle already exists is skipped, and existing categories / tags
 * are reused. Your login is read from environment variables in your own terminal — it is never
 * written to any file.
 */
import fs from 'node:fs';
import path from 'node:path';
import Medusa from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import { settings, products, type ProductSpec } from './catalog.ts';

// The SDK's upload code checks `body instanceof FileList`, a browser-only global. Node doesn't have it,
// so give it a harmless stand-in (our uploads are plain `File` objects, which Node does have).
(globalThis as { FileList?: unknown }).FileList ??= class FileList {};

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const only = argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const ONLY = only
	? only
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	: null;

// Handy shortcuts: --price=120 and --stock=5 override the values in catalog.ts for this run.
const numberArg = (name: string) => {
	const raw = argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
	return raw === undefined || raw === '' ? undefined : Number(raw);
};
const priceArg = numberArg('price');
if (priceArg !== undefined) settings.defaultPrice = priceArg;
const stockArg = numberArg('stock');
if (stockArg !== undefined) settings.stock = stockArg;

const say = (msg = '') => console.log(msg);
const isUrl = (s: string) => /^https?:\/\//i.test(s);

// ---------------------------------------------------------------------------------------------
// Plan + validation (no network)
// ---------------------------------------------------------------------------------------------

interface VariantPlan {
	title: string;
	sku: string;
	color: string;
	size: string;
}
interface Plan {
	spec: ProductSpec;
	sizes: string[];
	price: number | null;
	stock: number | null;
	variants: VariantPlan[];
}

function buildPlan(spec: ProductSpec): Plan {
	const sizes = spec.sizes ?? settings.sizes;
	const variants: VariantPlan[] = [];
	for (const color of spec.colors) {
		for (const size of sizes) {
			variants.push({
				title: `${color.name} / ${size}`,
				sku: `WC-${spec.code}-${color.code}-${size}`.toUpperCase().replace(/\s+/g, ''),
				color: color.name,
				size
			});
		}
	}
	return {
		spec,
		sizes,
		price: spec.price ?? settings.defaultPrice,
		stock: spec.stock !== undefined ? spec.stock : settings.stock,
		variants
	};
}

const photoPath = (file: string) => path.join(ROOT, settings.photosDir, file);
const videoPath = (file: string) => path.join(ROOT, settings.videosDir, file);

function validate(plans: Plan[]): string[] {
	const problems: string[] = [];
	const handles = new Set<string>();
	const skus = new Set<string>();

	for (const p of plans) {
		const name = p.spec.title;
		if (typeof p.price !== 'number' || !(p.price > 0)) {
			problems.push(`${name}: no price. Set settings.defaultPrice (or this product's price) in scripts/seed/catalog.ts.`);
		}
		if (handles.has(p.spec.handle)) problems.push(`${name}: duplicate handle "${p.spec.handle}".`);
		handles.add(p.spec.handle);
		if (p.spec.colors.length === 0) problems.push(`${name}: needs at least one color.`);
		if (p.sizes.length === 0) problems.push(`${name}: needs at least one size.`);
		for (const v of p.variants) {
			if (skus.has(v.sku)) problems.push(`${name}: duplicate SKU ${v.sku} (check the product/color codes).`);
			skus.add(v.sku);
		}
		for (const photo of p.spec.photos) {
			if (!fs.existsSync(photoPath(photo))) problems.push(`${name}: photo not found: ${settings.photosDir}/${photo}`);
		}
		for (const video of p.spec.videos ?? []) {
			if (!isUrl(video) && !fs.existsSync(videoPath(video))) {
				problems.push(`${name}: video not found: ${settings.videosDir}/${video}`);
			}
		}
	}
	return problems;
}

function printPlan(plans: Plan[]) {
	say(`Catalog: ${plans.length} product(s), ${plans.reduce((n, p) => n + p.variants.length, 0)} variants\n`);
	for (const p of plans) {
		const price = typeof p.price === 'number' ? `${p.price} ${settings.currency.toUpperCase()}` : 'NO PRICE';
		const stock = p.stock === null ? 'stock not tracked' : `${p.stock} per variant`;
		say(`• ${p.spec.title}  (/product/${p.spec.handle})`);
		say(`    category: ${p.spec.category}   tags: ${p.spec.tags.join(', ')}`);
		say(
			`    colors: ${p.spec.colors.map((c) => c.name).join(', ')}   sizes: ${p.sizes.join(', ')}   → ${p.variants.length} variants`
		);
		say(`    price: ${price}   ${stock}   photos: ${p.spec.photos.length}   videos: ${p.spec.videos?.length ?? 0}`);
	}
	say();
}

// ---------------------------------------------------------------------------------------------
// Connecting (real run only)
// ---------------------------------------------------------------------------------------------

function readEnvFile(): Record<string, string> {
	const file = path.join(ROOT, '.env');
	if (!fs.existsSync(file)) return {};
	const out: Record<string, string> = {};
	for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
		const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
		if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
	}
	return out;
}

function explain(e: unknown): string {
	const err = e as { status?: number; message?: string };
	return `${err?.status ? `[${err.status}] ` : ''}${err?.message ?? String(e)}`;
}

async function connect(): Promise<Medusa> {
	const baseUrl = (process.env.MEDUSA_BACKEND_URL ?? readEnvFile().MEDUSA_BACKEND_URL ?? '').replace(/\/+$/, '');
	if (!baseUrl) fail('MEDUSA_BACKEND_URL is not set (it is normally in the project .env).');

	const apiKey = process.env.MEDUSA_ADMIN_API_KEY;
	const email = process.env.MEDUSA_ADMIN_EMAIL;
	const password = process.env.MEDUSA_ADMIN_PASSWORD;

	if (apiKey) {
		say(`Connecting to ${baseUrl} with a secret API key…`);
		return new Medusa({ baseUrl, apiKey });
	}
	if (email && password) {
		say(`Connecting to ${baseUrl} as ${email}…`);
		const sdk = new Medusa({ baseUrl, auth: { type: 'jwt', jwtTokenStorageMethod: 'memory' } });
		try {
			const result = await sdk.auth.login('user', 'emailpass', { email, password });
			if (typeof result !== 'string') fail('Login needs an extra step this script cannot do. Use a secret API key instead.');
		} catch (e) {
			fail(`Login failed: ${explain(e)}`);
		}
		return sdk;
	}
	return fail(
		'No login provided. Set MEDUSA_ADMIN_API_KEY (a Secret API Key from Settings → Secret API Keys), ' +
			'or MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD, in your terminal first. See scripts/seed/README.md.'
	);
}

function fail(message: string): never {
	console.error(`\n✗ ${message}\n`);
	process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// The real work
// ---------------------------------------------------------------------------------------------

const MIME: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.mov': 'video/quicktime'
};

async function uploadFile(sdk: Medusa, cache: Map<string, string>, absPath: string): Promise<string> {
	const cached = cache.get(absPath);
	if (cached) return cached;
	const name = path.basename(absPath);
	const file = new File([fs.readFileSync(absPath)], name, { type: MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream' });
	const { files } = await sdk.admin.upload.create({ files: [file] });
	const url = files[0]?.url;
	if (!url) throw new Error(`Upload of ${name} returned no URL`);
	cache.set(absPath, url);
	return url;
}

async function seed(sdk: Medusa, plans: Plan[]) {
	// --- lookups -----------------------------------------------------------------------------
	const { sales_channels } = await sdk.admin.salesChannel.list({ limit: 100 });
	const channel =
		sales_channels.find((c) => c.name.toLowerCase() === settings.salesChannel.toLowerCase()) ??
		(sales_channels.length === 1 ? sales_channels[0] : undefined);
	if (!channel) {
		fail(
			`No sales channel named "${settings.salesChannel}". Found: ${sales_channels.map((c) => c.name).join(', ') || '(none)'}. ` +
				'Set settings.salesChannel in scripts/seed/catalog.ts.'
		);
	}
	say(`Sales channel: ${channel.name}`);

	const { shipping_profiles } = await sdk.admin.shippingProfile.list({ limit: 100 });
	const profile = shipping_profiles.find((p) => p.type === 'default') ?? shipping_profiles[0];
	say(`Shipping profile: ${profile ? profile.name : '(none found — products are created without one)'}`);

	const needsStock = plans.some((p) => p.stock !== null);
	let locationId: string | undefined;
	if (needsStock) {
		const { stock_locations } = await sdk.admin.stockLocation.list({ limit: 50, fields: 'id,name,*sales_channels' });
		const location = stock_locations[0];
		if (!location) fail('Stock is set in the catalog but your store has no stock location. Create one in Settings → Locations & Shipping.');
		locationId = location.id;
		say(`Stock location: ${location.name}`);
		const linked = (location.sales_channels ?? []).some((c) => c.id === channel.id);
		if (!linked) {
			say(`  ! "${location.name}" is not linked to the "${channel.name}" sales channel yet, so stock won't show on the site.`);
			say('    Link it in Settings → Locations & Shipping → the location → Sales channels.');
		}
	}
	say();

	// --- categories --------------------------------------------------------------------------
	const { product_categories } = await sdk.admin.productCategory.list({ limit: 500, fields: 'id,name,handle' });
	const categoryIds = new Map(product_categories.map((c) => [c.name.toLowerCase(), c.id]));
	for (const name of new Set(plans.map((p) => p.spec.category))) {
		if (categoryIds.has(name.toLowerCase())) {
			say(`Category "${name}": exists`);
			continue;
		}
		const { product_category } = await sdk.admin.productCategory.create({ name, is_active: true });
		categoryIds.set(name.toLowerCase(), product_category.id);
		say(`Category "${name}": created`);
	}

	// --- tags --------------------------------------------------------------------------------
	const { product_tags } = await sdk.admin.productTag.list({ limit: 1000 });
	const tagIds = new Map(product_tags.map((t) => [t.value.toLowerCase(), t.id]));
	let createdTags = 0;
	for (const value of new Set(plans.flatMap((p) => p.spec.tags))) {
		if (tagIds.has(value.toLowerCase())) continue;
		const { product_tag } = await sdk.admin.productTag.create({ value });
		tagIds.set(value.toLowerCase(), product_tag.id);
		createdTags++;
	}
	say(`Tags: ${tagIds.size} available (${createdTags} created)\n`);

	// --- products ----------------------------------------------------------------------------
	const uploads = new Map<string, string>();
	const created: string[] = [];
	const skipped: string[] = [];
	const failed: { title: string; error: string }[] = [];

	for (const plan of plans) {
		const { spec } = plan;
		try {
			const existing = await sdk.admin.product.list({ handle: spec.handle, limit: 1, fields: 'id,handle' });
			if (existing.products.length > 0) {
				say(`- ${spec.title}: already exists, skipped`);
				skipped.push(spec.title);
				continue;
			}

			say(`- ${spec.title}: uploading ${spec.photos.length} photo(s)…`);
			const imageUrls: string[] = [];
			for (const photo of spec.photos) imageUrls.push(await uploadFile(sdk, uploads, photoPath(photo)));

			const metadata: Record<string, string> = {};
			let videoIndex = 0;
			for (const video of spec.videos ?? []) {
				try {
					const url = isUrl(video) ? video : await uploadFile(sdk, uploads, videoPath(video));
					videoIndex++;
					metadata[videoIndex === 1 ? 'video' : `video_${videoIndex}`] = url;
				} catch (e) {
					say(`    (video "${video}" skipped: ${explain(e)})`);
				}
			}

			const body: HttpTypes.AdminCreateProduct = {
				title: spec.title,
				handle: spec.handle,
				description: spec.description,
				status: settings.status,
				thumbnail: imageUrls[0],
				images: imageUrls.map((url) => ({ url })),
				categories: [{ id: categoryIds.get(spec.category.toLowerCase())! }],
				tags: spec.tags.map((t) => ({ id: tagIds.get(t.toLowerCase())! })),
				sales_channels: [{ id: channel.id }],
				options: [
					{ title: 'Color', values: spec.colors.map((c) => c.name) },
					{ title: 'Size', values: plan.sizes }
				],
				variants: plan.variants.map((v) => ({
					title: v.title,
					sku: v.sku,
					manage_inventory: plan.stock !== null,
					allow_backorder: false,
					options: { Color: v.color, Size: v.size },
					prices: [{ currency_code: settings.currency, amount: plan.price! }]
				})),
				...(profile ? { shipping_profile_id: profile.id } : {}),
				...(Object.keys(metadata).length ? { metadata } : {})
			};

			await sdk.admin.product.create(body);
			say(`    created with ${plan.variants.length} variants`);

			if (plan.stock !== null && locationId) {
				const { inventory_items } = await sdk.admin.inventoryItem.list({ sku: plan.variants.map((v) => v.sku), limit: 500 });
				for (const item of inventory_items) {
					const level = { location_id: locationId, stocked_quantity: plan.stock };
					try {
						await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(item.id, { create: [level] });
					} catch {
						await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(item.id, { update: [level] });
					}
				}
				say(`    stock set to ${plan.stock} on ${inventory_items.length} variant(s)`);
			}
			created.push(spec.title);
		} catch (e) {
			say(`    ✗ failed: ${explain(e)}`);
			failed.push({ title: spec.title, error: explain(e) });
		}
	}

	// --- report ------------------------------------------------------------------------------
	say('\n──────── Done ────────');
	say(`Created: ${created.length}${created.length ? ' — ' + created.join(', ') : ''}`);
	if (skipped.length) say(`Skipped (already there): ${skipped.join(', ')}`);
	if (failed.length) {
		say(`Failed: ${failed.length}`);
		for (const f of failed) say(`  • ${f.title}: ${f.error}`);
	}
	say('\nReload your site: the products appear on /shop and the home page straight away.');
	if (failed.length) process.exit(1);
}

// ---------------------------------------------------------------------------------------------

const selected = ONLY ? products.filter((p) => ONLY.includes(p.handle)) : products;
if (ONLY && selected.length === 0) fail(`--only matched nothing. Handles: ${products.map((p) => p.handle).join(', ')}`);

const plans = selected.map(buildPlan);
printPlan(plans);

const problems = validate(plans);
if (problems.length) {
	console.error('Fix these first:');
	for (const p of problems) console.error(`  ✗ ${p}`);
	process.exit(1);
}

if (DRY_RUN) {
	say('Dry run: the catalog looks good and nothing was sent to Medusa.');
} else {
	const sdk = await connect();
	await seed(sdk, plans);
}
