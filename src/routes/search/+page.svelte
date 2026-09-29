<script lang="ts">
	import { Metadata } from '$lib/components/ui/seo';
	import { page } from '$app/state';
	import { getProductsQuery } from 'sveltekit-medusa-sdk';
	import { toCatalogProduct, formatPrice, PRODUCT_FIELDS } from '$lib/medusa/catalog';
	import { safe } from '$lib/medusa/safe';
	import ProductMedia from '$lib/components/ProductMedia.svelte';

	let searchTerm = $derived(page.url.searchParams.get('q') || '');
	let hoveredProductColors = $state<{ [key: string]: number }>({});

	// Server-side search: Medusa matches the term against product titles and descriptions.
	// The "Curated for You" fallback shows the newest products when nothing matches.
	const results = $derived(
		await safe(async () => {
			const q = searchTerm.trim();
			const [found, curated] = await Promise.all([
				getProductsQuery({ q: q || undefined, limit: 50, fields: PRODUCT_FIELDS }),
				getProductsQuery({ limit: 4, order: '-created_at', fields: PRODUCT_FIELDS })
			]);
			return {
				found: found.products.map(toCatalogProduct),
				curated: curated.products.map(toCatalogProduct)
			};
		})
	);

	let searchResults = $derived(results.data?.found ?? []);
	const topSelling = $derived(results.data?.curated ?? []);

	function getActiveColorIndex(productId: string) {
		return hoveredProductColors[productId] || 0;
	}
</script>

<Metadata config={{ title: searchTerm ? `Search: ${searchTerm}` : 'Search', noindex: true }} />

{#if searchResults.length === 0}
	<div class="bg-white min-h-screen">
		<div class="border-b border-gray-200 py-16">
			<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
				<h1 class="text-5xl md:text-6xl font-serif mb-4">No results for '{searchTerm}'</h1>
				<p class="text-lg text-gray-600">Try adjusting your search or browse our curated selection</p>
			</div>
		</div>

		<div class="h-32"></div>

		<section class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-32">
			<h2 class="text-3xl font-serif mb-12">Curated for You</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
				{#each topSelling as product (product.id)}
					<a href={`/product/${product.handle}`} class="group">
						<div class="aspect-[3/4] bg-gray-100 border border-gray-200 mb-4 relative overflow-hidden">
							<ProductMedia src={product.media[0]} poster={product.images[0]} alt={product.name} label="[PRODUCT IMAGE]" />
							<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
						</div>

						<div class="space-y-2">
							<h3 class="text-sm tracking-wide group-hover:opacity-70 transition-opacity">
								{product.name}
							</h3>
							<div class="flex items-center space-x-2">
								{#each product.colors.slice(0, 3) as color, idx (idx)}
									<div
										class="w-4 h-4 border border-gray-300 rounded-full"
										style="background-color: {color.hex}"
										title={color.name}
									></div>
								{/each}
							</div>
							<p class="text-sm">{formatPrice(product.price, product.currency)}</p>
						</div>
					</a>
				{/each}
			</div>

			<div class="text-center mt-16">
				<a
					href="/shop"
					class="inline-block border-2 border-gray-900 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-900 hover:text-white transition-all"
				>
					View Full Collection
				</a>
			</div>
		</section>
	</div>
{:else}
	<div class="bg-white min-h-screen">
		<div class="border-b border-gray-200 py-16">
			<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
				<h1 class="text-5xl md:text-6xl font-serif mb-4">Results for '{searchTerm}'</h1>
				<p class="text-lg text-gray-600">{searchResults.length} items found</p>
			</div>
		</div>

		<div class="h-32"></div>

		<section class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-32">
			<div class="space-y-16">
				{#each searchResults as product, index (product.id)}
					{@const patternIndex = index % 4}
					{@const activeColorIndex = getActiveColorIndex(product.id)}

					{#if patternIndex === 0}
						<div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
							<a
								href={`/product/${product.handle}`}
								class="lg:col-span-3 aspect-[3/4] bg-gray-100 border border-gray-200 relative group overflow-hidden"
							>
								<ProductMedia src={product.media[0]} poster={product.images[0]} alt={product.name} label="[HERO PRODUCT IMAGE]" />
								<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
							</a>

							<div class="lg:col-span-2 flex flex-col justify-center space-y-6">
								<div>
									<a
										href={`/product/${product.handle}`}
										class="text-2xl md:text-3xl tracking-wide hover:opacity-70 transition-opacity"
									>
										{product.name}
									</a>
									<p class="text-sm text-gray-500 mt-2">{product.category}</p>
								</div>

								<p class="text-xl">{formatPrice(product.price, product.currency)}</p>

								<div>
									<p class="text-xs tracking-[0.2em] uppercase mb-3 text-gray-600">Available Colors</p>
									<div class="flex space-x-3">
										{#each product.colors as color, colorIdx (colorIdx)}
											<button
												onmouseenter={() =>
													(hoveredProductColors = {
														...hoveredProductColors,
														[product.id]: colorIdx
													})}
												onmouseleave={() => {
													const updated = { ...hoveredProductColors };
													delete updated[product.id];
													hoveredProductColors = updated;
												}}
												class="w-10 h-10 rounded-full border-2 transition-all hover:scale-110 {activeColorIndex ===
												colorIdx
													? 'border-gray-900 ring-2 ring-gray-300'
													: 'border-gray-300'}"
												style="background-color: {color.hex}"
												title={color.name}
											></button>
										{/each}
									</div>
								</div>

								<p class="text-sm text-gray-600 leading-relaxed">{product.description}</p>

								<a
									href={`/product/${product.handle}`}
									class="inline-block border-2 border-gray-900 px-8 py-3 text-sm tracking-[0.2em] uppercase text-center hover:bg-gray-900 hover:text-white transition-all w-fit"
								>
									View Details
								</a>
							</div>
						</div>
					{:else if patternIndex === 1}
						{@const nextProduct = searchResults[index + 1]}
						{#if nextProduct}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
								{#each [product, nextProduct] as prod (prod.id)}
									{@const prodActiveColorIndex = getActiveColorIndex(prod.id)}
									<div>
										<a
											href={`/product/${prod.handle}`}
											class="block aspect-[3/4] bg-gray-100 border border-gray-200 mb-4 relative group overflow-hidden"
										>
											<ProductMedia src={prod.media[0]} poster={prod.images[0]} alt={prod.name} label="[PRODUCT IMAGE]" />
											<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
										</a>

										<div class="space-y-3">
											<a
												href={`/product/${prod.handle}`}
												class="text-lg tracking-wide hover:opacity-70 transition-opacity block"
											>
												{prod.name}
											</a>

											<div class="flex space-x-2">
												{#each prod.colors as color, colorIdx (colorIdx)}
													<button
														onmouseenter={() =>
															(hoveredProductColors = {
																...hoveredProductColors,
																[prod.id]: colorIdx
															})}
														onmouseleave={() => {
															const updated = { ...hoveredProductColors };
															delete updated[prod.id];
															hoveredProductColors = updated;
														}}
														class="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 {prodActiveColorIndex ===
														colorIdx
															? 'border-gray-900'
															: 'border-gray-300'}"
														style="background-color: {color.hex}"
														title={color.name}
													></button>
												{/each}
											</div>

											<p class="text-sm">{formatPrice(prod.price, prod.currency)}</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					{:else if patternIndex === 3}
						<div class="max-w-2xl mx-auto">
							<a
								href={`/product/${product.handle}`}
								class="block aspect-[3/4] bg-gray-100 border border-gray-200 mb-4 relative group overflow-hidden"
							>
								<ProductMedia src={product.media[0]} poster={product.images[0]} alt={product.name} label="[CENTERED PRODUCT IMAGE]" />
								<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
							</a>

							<div class="text-center space-y-3">
								<a
									href={`/product/${product.handle}`}
									class="text-xl tracking-wide hover:opacity-70 transition-opacity block"
								>
									{product.name}
								</a>

								<div class="flex space-x-2 justify-center">
									{#each product.colors as color, colorIdx (colorIdx)}
										<button
											onmouseenter={() =>
												(hoveredProductColors = { ...hoveredProductColors, [product.id]: colorIdx })}
											onmouseleave={() => {
												const updated = { ...hoveredProductColors };
												delete updated[product.id];
												hoveredProductColors = updated;
											}}
											class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 {activeColorIndex ===
											colorIdx
												? 'border-gray-900'
												: 'border-gray-300'}"
											style="background-color: {color.hex}"
											title={color.name}
										></button>
									{/each}
								</div>

								<p class="text-sm">{formatPrice(product.price, product.currency)}</p>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	</div>
{/if}
