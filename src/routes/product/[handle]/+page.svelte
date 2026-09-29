<script lang="ts">
	import { page } from '$app/state';
	import Play from '@lucide/svelte/icons/play';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { getProductQuery, getProductsQuery, addToCart } from 'sveltekit-medusa-sdk';
	import {
		toCatalogProduct,
		findVariant,
		isAvailable,
		formatPrice,
		PRODUCT_FIELDS
	} from '$lib/medusa/catalog';
	import { safe } from '$lib/medusa/safe';
	import { dev } from '$app/env';
	import ProductMedia from '$lib/components/ProductMedia.svelte';
	import SizeChartModal from '$lib/components/SizeChartModal.svelte';
	import StockBadge from '$lib/components/StockBadge.svelte';
	import WishlistButton from '$lib/components/WishlistButton.svelte';
	import * as ProductParts from '$lib/components/ui/product';
	import { Metadata } from '$lib/components/ui/seo';

	// Live product from Medusa, looked up by its handle (`/product/{handle}`). `raw` is the
	// untouched Medusa product, kept for the SEO structured data.
	const result = $derived(
		await safe(async () => {
			const handle = page.params.handle ?? '';
			const [raw, list] = await Promise.all([
				getProductQuery({ slug: handle, fields: PRODUCT_FIELDS }),
				getProductsQuery({ limit: 4, fields: PRODUCT_FIELDS })
			]);
			return {
				raw,
				product: raw ? toCatalogProduct(raw) : null,
				others: list.products.map(toCatalogProduct)
			};
		})
	);

	let product = $derived(result.data?.product ?? null);
	let relatedProducts = $derived(
		(result.data?.others ?? []).filter((p) => p.id !== product?.id).slice(0, 2)
	);

	let selectedColor = $state(0);
	let selectedSize = $state('');
	let quantity = $state(1);
	let activeTab = $state<'silhouette' | 'fit'>('silhouette');
	let openAccordion = $state<string | null>(null);
	let showCTABar = $state(false);
	let sizeChartOpen = $state(false);

	// Reset the choices when navigating from one product to another (the component is reused).
	$effect(() => {
		void page.params.handle;
		selectedColor = 0;
		selectedSize = '';
		quantity = 1;
		cartMessage = null;
	});

	$effect(() => {
		const handleScroll = () => {
			showCTABar = window.scrollY > 600;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const activeColor = $derived(product?.colors[selectedColor] ?? null);

	// Gallery: the product's videos and photos from Medusa (videos first), or the wireframe
	// placeholders when there are none.
	const placeholderLabels = ['[POWER SHOT]', '[THE SILHOUETTE]', '[BACK DETAIL]', '[CLOSE-UP TEXTURE]'];
	const slides = $derived(
		product?.media.length
			? product.media.map((src) => ({ src, label: '' }))
			: placeholderLabels.map((label) => ({ src: null, label }))
	);

	// The variant that matches the chosen color + size (size only counts once one is picked).
	const selectedVariant = $derived(
		product
			? findVariant(product, activeColor?.name ?? null, product.sizes.length ? selectedSize || null : null)
			: undefined
	);

	// Cheapest variant price until a full selection narrows it down.
	const displayPrice = $derived(selectedVariant?.price ?? product?.price ?? null);

	// Stock messaging, from real inventory. `maxQuantity` is null when stock isn't tracked.
	const stock = $derived.by(() => {
		if (!product) return { status: 'in-stock' as const, quantity: undefined };
		const scope = product.variants.filter(
			(v) =>
				(!activeColor || v.color === activeColor.name) && (!selectedSize || v.size === selectedSize)
		);
		if (scope.length === 0 || scope.every((v) => !v.inStock))
			return { status: 'out-of-stock' as const, quantity: undefined };
		const left = selectedVariant?.maxQuantity;
		if (left != null && left > 0 && left <= 5) return { status: 'low-stock' as const, quantity: left };
		return { status: 'in-stock' as const, quantity: undefined };
	});

	const quantityOptions = $derived.by(() => {
		const cap = selectedVariant?.maxQuantity;
		const max = cap == null ? 5 : Math.max(1, Math.min(5, cap));
		return Array.from({ length: max }, (_, i) => i + 1);
	});

	$effect(() => {
		if (!quantityOptions.includes(quantity)) quantity = quantityOptions.at(-1) ?? 1;
	});

	let adding = $state(false);
	let cartMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	async function handleAddToCart() {
		if (!product || adding) return;
		if (product.sizes.length && !selectedSize) {
			cartMessage = { type: 'error', text: 'Please select a size.' };
			return;
		}
		if (!selectedVariant) {
			cartMessage = { type: 'error', text: 'This combination is not available.' };
			return;
		}
		if (!selectedVariant.inStock) {
			cartMessage = { type: 'error', text: 'Sorry, this piece is sold out.' };
			return;
		}
		adding = true;
		cartMessage = null;
		try {
			await addToCart({ variant_id: selectedVariant.id, quantity });
			cartMessage = { type: 'success', text: 'Added to your selection.' };
		} catch (e) {
			const err = e as { body?: { message?: string }; message?: string };
			cartMessage = {
				type: 'error',
				text: err?.body?.message ?? err?.message ?? 'Could not add this piece. Please try again.'
			};
		} finally {
			adding = false;
		}
	}

	function toggleAccordion(section: string) {
		openAccordion = openAccordion === section ? null : section;
	}

	const sizeRows = [
		{ size: 'XS', bust: '32-33', waist: '24-25', hip: '34-35' },
		{ size: 'S', bust: '34-35', waist: '26-27', hip: '36-37' },
		{ size: 'M', bust: '36-37', waist: '28-29', hip: '38-39' },
		{ size: 'L', bust: '38-40', waist: '30-32', hip: '40-42' },
		{ size: 'XL', bust: '42-44', waist: '34-36', hip: '44-46' }
	];
</script>

{#if result.error}
	<div class="max-w-7xl mx-auto px-4 py-16 mt-16 md:mt-20 text-center">
		<h1 class="text-2xl mb-4">This piece is unavailable right now</h1>
		<p class="text-sm text-gray-600 mb-6">{dev ? result.error : 'Please try again in a moment.'}</p>
		<a href="/shop" class="underline">Return to Shop</a>
	</div>
{:else if !product}
	<div class="max-w-7xl mx-auto px-4 py-16 mt-16 md:mt-20 text-center">
		<h1 class="text-2xl mb-4">Product Not Found</h1>
		<a href="/shop" class="underline">Return to Shop</a>
	</div>
{:else}
	<Metadata
		config={{
			title: product.name,
			description: product.description || undefined,
			image: product.images[0],
			ogType: 'product'
		}}
	/>
	<!-- Structured data (schema.org/Product) for search engines; renders nothing visible. -->
	<ProductParts.Root product={result.data?.raw}>
		<ProductParts.JsonLd />
	</ProductParts.Root>

	<div class="bg-white">
		<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-6">
			<a href="/shop" class="inline-flex items-center space-x-2 text-sm hover:opacity-70 transition-opacity">
				<ChevronLeft class="w-4 h-4" />
				<span>Back to Collection</span>
			</a>
		</div>

		<!-- 1. The "Power" Hero - Split Screen 60/40 -->
		<section class="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 pb-8 md:pb-16">
			<div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
				<div class="lg:col-span-3">
					<div class="lg:hidden">
						<div class="relative">
							<div class="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
								{#each slides as slide, i (i)}
									<div class="flex-shrink-0 w-[80vw] aspect-[3/4] bg-gray-100 border border-gray-300 relative overflow-hidden snap-center rounded-sm">
										<ProductMedia src={slide.src} poster={product.images[0]} controls alt={product.name} label={slide.label} />
									</div>
								{/each}

								<div class="flex-shrink-0 w-[80vw] aspect-[3/4] bg-gray-900 border border-gray-300 relative snap-center rounded-sm">
									<div class="absolute inset-0 flex items-center justify-center text-white">
										<div class="text-center">
											<Play class="w-12 h-12 text-white mb-3 mx-auto opacity-80" />
											<p class="text-sm text-gray-300 mb-2">[360° VIEW]</p>
											<p class="text-xs text-gray-400">10-15 sec loop</p>
										</div>
									</div>
								</div>
							</div>

							<div class="flex justify-center gap-1.5 mt-4">
								{#each Array.from({ length: slides.length + 1 }, (_, n) => n) as i (i)}
									<div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
								{/each}
							</div>
						</div>
					</div>

					<div class="hidden lg:block space-y-4">
						{#each slides as slide, i (i)}
							<div class="aspect-[3/4] bg-gray-100 border border-gray-300 relative overflow-hidden">
								<ProductMedia src={slide.src} poster={product.images[0]} controls alt={product.name} label={slide.label} />
							</div>
						{/each}

						<div class="aspect-video bg-gray-900 border border-gray-300 relative flex items-center justify-center">
							<div class="text-center">
								<Play class="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<p class="text-sm text-gray-400 mb-2">[360° VIEW VIDEO]</p>
								<p class="text-xs text-gray-500">Model walks, spins, shows fit</p>
								<p class="text-xs text-gray-400 mt-2">10-15sec | 1920 x 1080px</p>
							</div>
						</div>
					</div>
				</div>

				<div class="lg:col-span-2">
					<div class="lg:sticky lg:top-24 space-y-8">
						<div>
							<div class="flex items-start justify-between mb-4">
								<h1 class="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
									{product.name}
								</h1>
								{#if stock.status !== 'in-stock'}
									<span class="border border-gray-900 px-3 py-1 text-xs tracking-wider whitespace-nowrap ml-4">
										{stock.status === 'out-of-stock' ? 'SOLD OUT' : 'LIMITED'}
									</span>
								{/if}
							</div>
							{#if product.category}
								<p class="text-sm text-gray-500 mb-4">{product.category}</p>
							{/if}

							<div class="mb-4">
								<StockBadge status={stock.status} quantity={stock.quantity} />
							</div>

							<p class="text-3xl">{formatPrice(displayPrice, product.currency)}</p>
						</div>

						{#if product.description}
							<p class="text-sm text-gray-700 leading-relaxed">{product.description}</p>
						{/if}

						{#if product.colors.length > 0}
							<div>
								<h3 class="text-xs tracking-[0.2em] uppercase mb-4 text-gray-900">
									Color — {activeColor?.name}
								</h3>
								<div class="flex space-x-3">
									{#each product.colors as color, idx (idx)}
										<button
											onclick={() => (selectedColor = idx)}
											class="w-12 h-12 rounded-full border-2 transition-all hover:scale-110 {selectedColor ===
											idx
												? 'border-gray-900 ring-2 ring-gray-300'
												: 'border-gray-300'}"
											style="background-color: {color.hex}"
											title={color.name}
										></button>
									{/each}
								</div>
							</div>
						{/if}

						{#if product.sizes.length > 0}
							<div>
								<div class="flex items-center justify-between mb-4">
									<h3 class="text-xs tracking-[0.2em] uppercase text-gray-900">
										Size {selectedSize && `— ${selectedSize}`}
									</h3>
									<button
										onclick={() => (sizeChartOpen = true)}
										class="text-xs underline hover:opacity-70 transition-opacity"
									>
										Size Guide
									</button>
								</div>
								<div class="grid grid-cols-5 gap-2">
									{#each product.sizes as size (size)}
										{@const available = isAvailable(product, activeColor?.name ?? null, size)}
										<button
											onclick={() => (selectedSize = size)}
											title={available ? undefined : 'Sold out in this color'}
											class="py-3 text-sm tracking-wider border-2 transition-all {selectedSize === size
												? 'border-gray-900 bg-gray-900 text-white'
												: 'border-gray-300 hover:border-gray-900'} {available
												? ''
												: 'text-gray-400 line-through'}"
										>
											{size}
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<div>
							<h3 class="text-xs tracking-[0.2em] uppercase mb-4 text-gray-900">Quantity</h3>
							<select
								bind:value={quantity}
								class="w-full border-2 border-gray-300 px-4 py-3 text-sm outline-none hover:border-gray-900 transition-colors"
							>
								{#each quantityOptions as num (num)}
									<option value={num}>{num}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-3">
							<button
								onclick={handleAddToCart}
								disabled={adding || stock.status === 'out-of-stock'}
								class="w-full bg-gray-900 text-white py-4 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{adding ? 'Adding…' : stock.status === 'out-of-stock' ? 'Sold Out' : 'Secure This Design'}
							</button>
							{#if cartMessage}
								<p
									role={cartMessage.type === 'error' ? 'alert' : 'status'}
									class="text-sm text-center {cartMessage.type === 'error' ? 'text-red-700' : 'text-gray-700'}"
								>
									{cartMessage.text}
									{#if cartMessage.type === 'success'}
										<a href="/cart" class="underline ml-1">View selection</a>
									{/if}
								</p>
							{/if}
						</div>

						<div class="flex justify-center">
							<WishlistButton productId={product.id} size="md" variant="text" class="text-xs" />
						</div>

						<p class="text-xs text-center text-gray-500">Fits true to size.</p>
					</div>
				</div>
			</div>
		</section>

		<!-- 2. The "Art of the Stitch" - Full Width -->
		<section class="relative py-32 my-16 overflow-hidden bg-gray-900">
			<div class="absolute inset-0">
				<div class="w-full h-full flex items-center justify-center">
					<div class="text-center text-white/20">
						<p class="text-sm mb-2">[MACRO VIDEO BACKGROUND]</p>
						<p class="text-xs">Extreme close-up: fabric weave, thread shimmer</p>
						<p class="text-xs mt-2">1920 x 1080px | Silent loop</p>
					</div>
				</div>
			</div>

			<div class="relative z-10 max-w-3xl mx-auto px-8 text-center text-white">
				<h2 class="text-4xl md:text-5xl font-serif italic mb-8 leading-tight">The Art of the Stitch</h2>
				<p class="text-xl leading-relaxed mb-4">Italian-Sourced. Hand-Finished in Milan.</p>
				<p class="text-xl leading-relaxed">Designed to Last a Lifetime.</p>
				<p class="text-xs text-white/40 mt-8">[Justifies premium pricing through quality proof]</p>
			</div>
		</section>

		<!-- 3. The "Perfect Fit" Interactive Concierge -->
		<section class="max-w-4xl mx-auto px-8 md:px-16 py-24">
			<h2 class="text-3xl md:text-4xl tracking-wide mb-12 text-center">Perfect Fit Concierge</h2>

			<div class="flex border-b-2 border-gray-200 mb-8">
				<button
					onclick={() => (activeTab = 'silhouette')}
					class="flex-1 pb-4 text-sm tracking-[0.2em] uppercase transition-all {activeTab ===
					'silhouette'
						? 'border-b-2 border-gray-900 -mb-0.5 font-medium'
						: 'text-gray-500 hover:text-gray-900'}"
				>
					The Silhouette
				</button>
				<button
					onclick={() => (activeTab = 'fit')}
					class="flex-1 pb-4 text-sm tracking-[0.2em] uppercase transition-all {activeTab === 'fit'
						? 'border-b-2 border-gray-900 -mb-0.5 font-medium'
						: 'text-gray-500 hover:text-gray-900'}"
				>
					The Fit Guide
				</button>
			</div>

			<div class="bg-gray-50 border border-gray-200 p-8">
				{#if activeTab === 'silhouette'}
					<div class="space-y-6">
						<h3 class="text-xl tracking-wide">How This Cut Enhances Your Form</h3>
						<p class="text-sm text-gray-700 leading-relaxed">
							The {product.name} is designed with a sculptural approach to fit. The cut follows the
							natural curves of the body, creating a streamlined silhouette that flatters without
							restricting movement.
						</p>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
							<div>
								<h4 class="text-xs tracking-[0.2em] uppercase mb-2 text-gray-900">Coverage</h4>
								<p class="text-sm text-gray-600">[Content] Medium coverage with adjustable fit options</p>
							</div>
							<div>
								<h4 class="text-xs tracking-[0.2em] uppercase mb-2 text-gray-900">Support</h4>
								<p class="text-sm text-gray-600">[Content] Structured with built-in shelf support</p>
							</div>
							<div>
								<h4 class="text-xs tracking-[0.2em] uppercase mb-2 text-gray-900">Best For</h4>
								<p class="text-sm text-gray-600">[Content] Pool lounging, beach activities, resort wear</p>
							</div>
							<div>
								<h4 class="text-xs tracking-[0.2em] uppercase mb-2 text-gray-900">Style Note</h4>
								<p class="text-sm text-gray-600">[Content] Pairs beautifully with high-waist bottoms</p>
							</div>
						</div>
					</div>
				{:else}
					<div class="space-y-6">
						<h3 class="text-xl tracking-wide">Find Your Perfect Size</h3>
						<p class="text-sm text-gray-700 leading-relaxed mb-6">
							Our pieces are designed to fit true to size. If you're between sizes or prefer a more
							relaxed fit, we recommend sizing up.
						</p>

						<div class="overflow-x-auto">
							<table class="w-full text-sm border border-gray-200">
								<thead class="bg-gray-100">
									<tr>
										<th class="border border-gray-200 px-4 py-3 text-left text-xs tracking-[0.2em] uppercase">Size</th>
										<th class="border border-gray-200 px-4 py-3 text-left text-xs tracking-[0.2em] uppercase">Bust (in)</th>
										<th class="border border-gray-200 px-4 py-3 text-left text-xs tracking-[0.2em] uppercase">Waist (in)</th>
										<th class="border border-gray-200 px-4 py-3 text-left text-xs tracking-[0.2em] uppercase">Hip (in)</th>
									</tr>
								</thead>
								<tbody>
									{#each sizeRows as row (row.size)}
										<tr class="hover:bg-gray-50">
											<td class="border border-gray-200 px-4 py-3 font-medium">{row.size}</td>
											<td class="border border-gray-200 px-4 py-3">{row.bust}</td>
											<td class="border border-gray-200 px-4 py-3">{row.waist}</td>
											<td class="border border-gray-200 px-4 py-3">{row.hip}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<p class="text-xs text-gray-500 mt-4">
							[Interactive size calculator placeholder - customer inputs measurements]
						</p>
					</div>
				{/if}
			</div>
		</section>

		<!-- 5. The "Materials & Care" Accordion -->
		<section class="max-w-4xl mx-auto px-8 md:px-16 py-16 border-t border-gray-200">
			<h2 class="text-3xl md:text-4xl tracking-wide mb-12 text-center">Materials & Care</h2>

			<div class="space-y-4">
				<div class="border-2 border-gray-200">
					<button
						onclick={() => toggleAccordion('composition')}
						class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
					>
						<span class="text-sm tracking-[0.2em] uppercase">Composition</span>
						<ChevronDown class="w-5 h-5 transition-transform {openAccordion === 'composition' ? 'rotate-180' : ''}" />
					</button>
					{#if openAccordion === 'composition'}
						<div class="px-6 pb-6 text-sm text-gray-700 leading-relaxed border-t border-gray-200 pt-6">
							<p class="mb-4">
								<strong>80% Recycled Polyamide</strong> — Ultra-soft, chlorine-resistant fabric sourced
								from regenerated fishing nets and textile waste.
							</p>
							<p>
								<strong>20% Elastane</strong> — High-stretch fiber for shape retention and long-lasting
								wear. UPF 50+ sun protection.
							</p>
							<p class="text-xs text-gray-400 mt-4">[WooCommerce product attributes]</p>
						</div>
					{/if}
				</div>

				<div class="border-2 border-gray-200">
					<button
						onclick={() => toggleAccordion('sustainability')}
						class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
					>
						<span class="text-sm tracking-[0.2em] uppercase">Sustainability</span>
						<ChevronDown class="w-5 h-5 transition-transform {openAccordion === 'sustainability' ? 'rotate-180' : ''}" />
					</button>
					{#if openAccordion === 'sustainability'}
						<div class="px-6 pb-6 text-sm text-gray-700 leading-relaxed border-t border-gray-200 pt-6">
							<p class="mb-4">
								<strong>Perfection in Production:</strong> Our swimwear is produced in small batches
								at a family-owned atelier in Northern Italy, where each piece is inspected by hand.
							</p>
							<p class="mb-4">
								We use <strong>ECONYL® regenerated nylon</strong>, a 100% regenerated fabric made from
								ocean and landfill waste. For every piece sold, we contribute to ocean cleanup
								initiatives.
							</p>
							<p>Our packaging is 100% plastic-free and fully recyclable.</p>
							<p class="text-xs text-gray-400 mt-4">[Brand sustainability story]</p>
						</div>
					{/if}
				</div>

				<div class="border-2 border-gray-200">
					<button
						onclick={() => toggleAccordion('care')}
						class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
					>
						<span class="text-sm tracking-[0.2em] uppercase">Care Instructions</span>
						<ChevronDown class="w-5 h-5 transition-transform {openAccordion === 'care' ? 'rotate-180' : ''}" />
					</button>
					{#if openAccordion === 'care'}
						<div class="px-6 pb-6 text-sm text-gray-700 leading-relaxed border-t border-gray-200 pt-6">
							<ul class="space-y-2">
								<li>• Rinse in cold water immediately after use</li>
								<li>• Hand wash with mild detergent</li>
								<li>• Lay flat to dry in shade (avoid direct sunlight)</li>
								<li>• Do not wring, bleach, iron, or dry clean</li>
								<li>• Avoid contact with rough surfaces and Velcro</li>
							</ul>
							<p class="text-xs text-gray-400 mt-4">[Product care guide]</p>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- 6. The "Styled With" Upsell -->
		{#if relatedProducts.length > 0}
			<section class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-24 border-t-2 border-gray-900">
				<h2 class="text-3xl md:text-4xl tracking-wide mb-12 text-center">Styled With</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
					{#each relatedProducts as item (item.id)}
						<div class="group">
							<a href={`/product/${item.handle}`} class="block mb-6">
								<div class="aspect-[4/5] bg-gray-100 border border-gray-200 relative overflow-hidden">
									<ProductMedia src={item.media[0]} poster={item.images[0]} alt={item.name} label="[STYLED PRODUCT IMAGE]" />
									<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
								</div>
							</a>

							<div class="space-y-4">
								<div>
									<a
										href={`/product/${item.handle}`}
										class="text-xl tracking-wide hover:opacity-70 transition-opacity block"
									>
										{item.name}
									</a>
									<p class="text-sm text-gray-500 mt-2">{item.category}</p>
								</div>

								<p class="text-lg">{formatPrice(item.price, item.currency)}</p>

								<a
									href={`/product/${item.handle}`}
									class="inline-block border-2 border-gray-900 px-6 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-900 hover:text-white transition-all"
								>
									Complete the Look
								</a>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<SizeChartModal
			isOpen={sizeChartOpen}
			onClose={() => (sizeChartOpen = false)}
			productType="bikini-top"
		/>

		<!-- 4. The "Bold Decision" Sticky CTA Bar -->
		{#if showCTABar}
			<div class="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-2xl border-t-2 border-gray-800">
				<div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
					<div class="flex items-center space-x-6">
						<div class="w-16 h-16 bg-gray-800 border border-gray-700 hidden md:block relative overflow-hidden">
							<ProductMedia src={product.media[0]} poster={product.images[0]} alt={product.name} label="[Img]" class="" />
						</div>
						<div>
							<p class="text-sm tracking-wide">{product.name}</p>
							<p class="text-lg">{formatPrice(displayPrice, product.currency)}</p>
						</div>
					</div>

					<div class="flex items-center space-x-6">
						<div class="hidden md:block text-right">
							{#if cartMessage}
								<p class="text-xs {cartMessage.type === 'error' ? 'text-red-300' : 'text-gray-300'}">{cartMessage.text}</p>
							{:else if stock.status === 'low-stock'}
								<p class="text-xs text-gray-400">Only {stock.quantity} left</p>
							{/if}
						</div>
						<button
							onclick={handleAddToCart}
							disabled={adding || stock.status === 'out-of-stock'}
							class="bg-white text-gray-900 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{adding ? 'Adding…' : stock.status === 'out-of-stock' ? 'Sold Out' : 'Secure This Design'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
