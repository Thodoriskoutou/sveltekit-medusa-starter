<script lang="ts">
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import X from '@lucide/svelte/icons/x';
	import Play from '@lucide/svelte/icons/play';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getProductsQuery, getProductCategoriesQuery } from 'sveltekit-medusa-sdk';
	import { toCatalogProduct, formatPrice, PRODUCT_FIELDS } from '$lib/medusa/catalog';
	import ProductMedia from '$lib/components/ProductMedia.svelte';
	import { safe } from '$lib/medusa/safe';
	import { dev } from '$app/env';
	import { Metadata } from '$lib/components/ui/seo';

	// Live catalog from Medusa. Awaiting inside `$derived` works because
	// `compilerOptions.experimental.async` is enabled in vite.config.ts. There is deliberately no
	// <svelte:boundary pending>: that would make the server render only the loading state.
	const catalog = $derived(
		await safe(async () => {
			const [productsResult, categoriesResult] = await Promise.all([
				getProductsQuery({ limit: 100, fields: PRODUCT_FIELDS }),
				getProductCategoriesQuery({ limit: 100 })
			]);
			const products = productsResult.products.map(toCatalogProduct);
			// Category filter options come from Medusa (in the admin's rank order), limited to
			// categories that actually contain products so a filter never leads to an empty page.
			const categories = categoriesResult.product_categories
				.slice()
				.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
				.filter((c) => products.some((p) => p.category === c.name))
				.map((c) => ({ name: c.name, handle: c.handle }));
			return { products, categories };
		})
	);

	const products = $derived(catalog.data?.products ?? []);
	const categories = $derived(['all', ...(catalog.data?.categories ?? []).map((c) => c.name)]);

	// The URL is the source of truth for the selected category (`/shop?category=bikini-tops`), so
	// the menu and footer links, the filter drawer, and the browser's back button all agree.
	const selectedCategory = $derived(
		catalog.data?.categories.find((c) => c.handle === page.url.searchParams.get('category'))?.name ?? 'all'
	);

	function selectCategory(name: string) {
		const handle = catalog.data?.categories.find((c) => c.name === name)?.handle;
		goto(handle ? `?category=${handle}` : page.url.pathname, { replace: true, reset: false });
	}

	let showFilters = $state(false);
	let sortBy = $state('featured');
	let hoveredProductColors = $state<{ [key: string]: number }>({});

	let filteredProducts = $derived(
		selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory)
	);

	function getActiveColorIndex(productId: string) {
		return hoveredProductColors[productId] || 0;
	}

	let completeTheLook = $derived(
		products.filter((p) => p.category !== selectedCategory).slice(0, 3)
	);

	const colorOptions = [
		{ name: 'White', hex: '#FFFFFF' },
		{ name: 'Black', hex: '#000000' },
		{ name: 'Sand', hex: '#D4B896' },
		{ name: 'Navy', hex: '#1E3A5F' },
		{ name: 'Coral', hex: '#FF6B6B' },
		{ name: 'Mint', hex: '#95E1D3' },
		{ name: 'Lavender', hex: '#C7A8E4' },
		{ name: 'Wine', hex: '#722F37' }
	];
</script>

<Metadata
	config={{
		title: selectedCategory === 'all' ? 'Shop' : selectedCategory,
		description: 'Luxury swimwear crafted from Italian fabrics.'
	}}
/>

<div class="bg-white">
	<!-- 1. Immersive Header (Category Identity) -->
	<section class="h-[40vh] min-h-[400px] border-b border-gray-200 flex items-center mt-16 md:mt-20">
		<div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 w-full">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
				<div>
					<h1 class="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light tracking-tight">
						{selectedCategory === 'all' ? 'All Styles' : selectedCategory}
					</h1>
					<p class="text-sm text-gray-400 mt-4">[Category heading annotation]</p>
				</div>

				<div class="lg:border-l lg:border-gray-200 lg:pl-12">
					<p class="text-base md:text-lg leading-relaxed text-gray-700 mb-4">
						Crafted for women who understand that true luxury is felt, not flaunted. Each piece is
						cut from Italian fabrics designed to move with your body.
					</p>
					<p class="text-base md:text-lg leading-relaxed text-gray-700">
						This collection celebrates sculptural minimalism—clean lines, architectural
						silhouettes, and timeless elegance.
					</p>
					<p class="text-xs text-gray-400 mt-6">[Mood/inspiration copy]</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 2. The "Utility Belt" - Sticky -->
	<div class="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
		<div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-4">
			<div class="md:hidden">
				<p class="text-sm text-gray-600 text-center mb-3">
					Showing <span class="font-medium">{filteredProducts.length}</span> Styles
				</p>
				<div class="flex items-center justify-between">
					<button
						onclick={() => (showFilters = !showFilters)}
						class="flex items-center space-x-2 text-sm tracking-wider uppercase hover:opacity-70 transition-opacity"
					>
						<SlidersHorizontal class="w-4 h-4" />
						<span>Filter</span>
					</button>

					<div class="relative">
						<button class="flex items-center space-x-2 text-sm tracking-wider uppercase hover:opacity-70 transition-opacity">
							<span>Sort</span>
							<ChevronDown class="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<div class="hidden md:flex items-center justify-between">
				<button
					onclick={() => (showFilters = !showFilters)}
					class="flex items-center space-x-2 text-sm tracking-wider uppercase hover:opacity-70 transition-opacity"
				>
					<SlidersHorizontal class="w-4 h-4" />
					<span>Filter By</span>
				</button>

				<p class="text-sm text-gray-600">
					Showing <span class="font-medium">{filteredProducts.length}</span> Styles
				</p>

				<div class="relative">
					<button class="flex items-center space-x-2 text-sm tracking-wider uppercase hover:opacity-70 transition-opacity">
						<span>Sort: {sortBy === 'featured' ? 'Featured' : sortBy}</span>
						<ChevronDown class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	</div>

	{#if showFilters}
		<div class="fixed inset-0 bg-black/30 z-40" onclick={() => (showFilters = false)} role="presentation"></div>

		<div class="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto">
			<div class="p-8">
				<div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
					<h2 class="text-xl tracking-wide">Filters</h2>
					<button onclick={() => (showFilters = false)} class="hover:opacity-70 transition-opacity">
						<X class="w-5 h-5" />
					</button>
				</div>

				<div class="mb-8">
					<h3 class="text-xs tracking-[0.2em] uppercase mb-4 text-gray-900">Category</h3>
					<div class="space-y-3">
						{#each categories as cat (cat)}
							<label class="flex items-center space-x-3 cursor-pointer group">
								<input
									type="radio"
									name="category"
									checked={selectedCategory === cat}
									onchange={() => selectCategory(cat)}
									class="w-4 h-4 accent-gray-900"
								/>
								<span class="text-sm group-hover:opacity-70 transition-opacity">
									{cat === 'all' ? 'All Styles' : cat}
								</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="mb-8">
					<h3 class="text-xs tracking-[0.2em] uppercase mb-4 text-gray-900">Size</h3>
					<div class="grid grid-cols-5 gap-2">
						{#each ['XS', 'S', 'M', 'L', 'XL'] as size (size)}
							<button
								class="border border-gray-300 py-2 text-sm hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
							>
								{size}
							</button>
						{/each}
					</div>
				</div>

				<div class="mb-8">
					<h3 class="text-xs tracking-[0.2em] uppercase mb-4 text-gray-900">Color</h3>
					<div class="grid grid-cols-5 gap-3">
						{#each colorOptions as color (color.name)}
							<button
								class="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-900 transition-all hover:scale-110"
								style="background-color: {color.hex}"
								title={color.name}
							></button>
						{/each}
					</div>
				</div>

				<div class="mb-8">
					<h3 class="text-xs tracking-[0.2em] uppercase mb-4 text-gray-900">Price Range</h3>
					<div class="space-y-3">
						{#each ['Under €100', '€100 - €150', '€150 - €200', 'Over €200'] as range (range)}
							<label class="flex items-center space-x-3 cursor-pointer group">
								<input type="checkbox" class="w-4 h-4 accent-gray-900" />
								<span class="text-sm group-hover:opacity-70 transition-opacity">{range}</span>
							</label>
						{/each}
					</div>
				</div>

				<button
					class="w-full border-2 border-gray-900 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-900 hover:text-white transition-all"
				>
					Clear All Filters
				</button>
			</div>
		</div>
	{/if}

	<!-- 3. Asymmetrical "Focus" Grid (1-2-1 Pattern) -->
	<section class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-16">
		<div class="space-y-16">
			{#if catalog.error}
				<div class="text-center py-24">
					<p class="text-2xl font-serif mb-3">The collection is unavailable</p>
					<p class="text-sm text-gray-600">
						{dev ? catalog.error : 'Please try again in a moment.'}
					</p>
				</div>
			{:else if filteredProducts.length === 0}
				<div class="text-center py-24">
					<p class="text-2xl font-serif mb-3">New pieces are on their way</p>
					<p class="text-sm text-gray-600">Our collection is being prepared — please check back soon.</p>
				</div>
			{/if}
			{#each filteredProducts as product, index (product.id)}
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
												(hoveredProductColors = { ...hoveredProductColors, [product.id]: colorIdx })}
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
								<p class="text-xs text-gray-400 mt-2">[Hover to preview color]</p>
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
					{@const nextProduct = filteredProducts[index + 1]}
					{#if nextProduct}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
							{#each [product, nextProduct] as prod (prod.id)}
								{@const prodActiveColorIndex = getActiveColorIndex(prod.id)}
								<div>
									<a
										href={`/product/${prod.handle}`}
										class="block aspect-[3/4] bg-gray-100 border border-gray-200 mb-4 relative group overflow-hidden"
									>
										<ProductMedia src={prod.media[0]} poster={prod.images[0]} alt={prod.name} />
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

			<!-- 4. In-Grid Editorial Break (after 3rd product) -->
			{#if filteredProducts.length > 3}
				<div class="my-16 py-24 bg-gray-50 border-y border-gray-200">
					<div class="max-w-4xl mx-auto text-center px-8">
						<div class="aspect-video bg-gray-100 border border-gray-200 mb-6 relative flex items-center justify-center">
							<div class="text-center">
								<Play class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-sm text-gray-400">[ATMOSPHERIC VIDEO]</p>
								<p class="text-xs text-gray-500 mt-2">Close-up: fabric texture, water, craftsmanship</p>
								<p class="text-xs text-gray-400 mt-1">10-15sec loop | 1280 x 720px</p>
							</div>
						</div>
						<p class="text-xl italic font-serif text-gray-700 leading-relaxed">
							"Each stitch is a testament to Italian craftsmanship. We obsess over the details so
							you can simply enjoy the experience."
						</p>
						<p class="text-xs text-gray-400 mt-4">[Craftsmanship editorial break]</p>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- 5. Complete the Look (Cross-Sell) -->
	{#if completeTheLook.length > 0}
		<section class="border-t border-gray-200 bg-gray-50 py-24">
			<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
				<div class="mb-12">
					<h2 class="text-3xl md:text-4xl tracking-wide mb-2">Complete the Look</h2>
					<p class="text-sm text-gray-500">Curated essentials to complement your style</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					{#each completeTheLook as product (product.id)}
						<a href={`/product/${product.handle}`} class="group">
							<div class="aspect-[3/4] bg-white border border-gray-200 mb-4 relative overflow-hidden">
								<ProductMedia src={product.media[0]} poster={product.images[0]} alt={product.name} />
								<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
							</div>

							<div class="space-y-2">
								<h3 class="text-sm tracking-wide group-hover:opacity-70 transition-opacity">
									{product.name}
								</h3>
								<p class="text-sm text-gray-500">{product.category}</p>
								<p class="text-sm">{formatPrice(product.price, product.currency)}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- 6. Fit Concierge Footer Section -->
	<section class="border-t-2 border-gray-900 bg-white py-16">
		<div class="max-w-5xl mx-auto px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
				<div class="space-y-4">
					<div class="w-16 h-16 border-2 border-gray-900 mx-auto flex items-center justify-center">
						<span class="text-xs text-gray-400">[ICON]</span>
					</div>
					<h3 class="text-sm tracking-[0.2em] uppercase">Find Your Size</h3>
					<p class="text-sm text-gray-600 leading-relaxed">
						Not sure what fits? Our interactive size guide helps you find your perfect match.
					</p>
					<button class="text-xs tracking-wider uppercase underline hover:opacity-70 transition-opacity">
						Size Guide
					</button>
				</div>

				<div class="space-y-4">
					<div class="w-16 h-16 border-2 border-gray-900 mx-auto flex items-center justify-center">
						<span class="text-xs text-gray-400">[ICON]</span>
					</div>
					<h3 class="text-sm tracking-[0.2em] uppercase">Personal Styling Advice</h3>
					<p class="text-sm text-gray-600 leading-relaxed">
						Book a complimentary virtual consultation with one of our swimwear stylists.
					</p>
					<button class="text-xs tracking-wider uppercase underline hover:opacity-70 transition-opacity">
						Book Now
					</button>
				</div>

				<div class="space-y-4">
					<div class="w-16 h-16 border-2 border-gray-900 mx-auto flex items-center justify-center">
						<span class="text-xs text-gray-400">[ICON]</span>
					</div>
					<h3 class="text-sm tracking-[0.2em] uppercase">Worldwide Express</h3>
					<p class="text-sm text-gray-600 leading-relaxed">
						Free express shipping on all orders over $150. Arrives in 2-5 business days.
					</p>
					<button class="text-xs tracking-wider uppercase underline hover:opacity-70 transition-opacity">
						Learn More
					</button>
				</div>
			</div>
		</div>
	</section>
</div>
