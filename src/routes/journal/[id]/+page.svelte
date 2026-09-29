<script lang="ts">
	import { getProductsQuery } from 'sveltekit-medusa-sdk';
	import { toCatalogProduct, formatPrice, PRODUCT_FIELDS } from '$lib/medusa/catalog';
	import { safe } from '$lib/medusa/safe';
	import ProductMedia from '$lib/components/ProductMedia.svelte';

	// "Shop the Story": the newest products. Point this at a Medusa collection later to curate it
	// per article. If Medusa is unreachable the section is simply hidden.
	const catalog = $derived(
		await safe(async () => {
			const res = await getProductsQuery({ limit: 3, order: '-created_at', fields: PRODUCT_FIELDS });
			return res.products.map(toCatalogProduct);
		})
	);

	const article = {
		title: 'The Eternal Summer: A Manifesto on Timeless Design',
		category: 'Philosophy',
		date: 'March 5, 2026',
		author: 'Elena Rossi, Creative Director',
		readTime: '8 min read'
	};

	const featuredProducts = $derived(catalog.data ?? []);

	const relatedArticles = [
		{ title: 'Mediterranean Mornings: The Art of Slow Summer', category: 'Travel' },
		{ title: 'The Architecture of Form: Italian Textile Heritage', category: 'Craft' }
	];
</script>

<div class="bg-white">
	<div class="max-w-4xl mx-auto px-8 pt-8">
		<a href="/journal" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
			← Back to Journal
		</a>
	</div>

	<div class="h-32"></div>

	<article class="max-w-3xl mx-auto px-8">
		<div class="text-center mb-12">
			<span class="text-xs tracking-[0.3em] uppercase text-gray-500 mb-4 block">
				{article.category}
			</span>
			<h1 class="text-5xl md:text-6xl font-serif mb-8 leading-tight">{article.title}</h1>
			<div class="flex items-center justify-center space-x-6 text-sm text-gray-600">
				<span>{article.author}</span>
				<span>•</span>
				<span>{article.date}</span>
				<span>•</span>
				<span>{article.readTime}</span>
			</div>
		</div>

		<div class="aspect-[16/9] bg-gray-100 border border-gray-200 mb-16">
			<div class="w-full h-full flex items-center justify-center">
				<div class="text-center">
					<p class="text-sm text-gray-400 mb-2">[HERO IMAGE]</p>
					<p class="text-xs text-gray-500">Editorial photograph</p>
					<p class="text-xs text-gray-400 mt-2">1200 x 675px</p>
				</div>
			</div>
		</div>

		<div class="prose prose-lg max-w-[750px] mx-auto">
			<p class="text-lg leading-relaxed text-gray-700 mb-8">
				[Opening Paragraph] There is a particular quality to garments designed without the
				pressure of seasonal relevance. In our Milan atelier, we reject the relentless churn of
				"collections" in favor of something more permanent: pieces that honor the body, respect
				the environment, and transcend the fleeting nature of trends.
			</p>

			<p class="text-base leading-relaxed text-gray-700 mb-8">
				[Body Content] When we set out to design our first swimwear line, we asked ourselves a
				question: What would it mean to create a piece that could be worn five years from now and
				still feel as relevant as the day it was made? The answer led us to Italy—to the same
				ateliers that supply the world's most revered fashion houses.
			</p>

			<div class="h-32"></div>

			<blockquote class="border-l-4 border-gray-900 pl-8 my-16">
				<p class="text-3xl md:text-4xl italic font-serif text-gray-900 leading-relaxed">
					"Luxury is not about the price tag. It is about the quiet confidence of knowing that what
					you wear was made with intention."
				</p>
				<footer class="text-sm text-gray-600 mt-6">— Elena Rossi, Creative Director</footer>
			</blockquote>

			<div class="h-32"></div>

			<p class="text-base leading-relaxed text-gray-700 mb-8">
				[Body Content Continued] Each piece is cut from ECONYL® regenerated nylon—a fabric born
				from ocean waste and destined to last a lifetime. The process is slow. The margins are
				thin. But the result is something we are proud to sign our name to.
			</p>

			<h2 class="text-3xl font-serif mt-16 mb-6">The Philosophy of Form</h2>

			<p class="text-base leading-relaxed text-gray-700 mb-8">
				[Section Content] In an industry obsessed with "newness," we believe in the power of
				refinement. Our silhouettes are not reinvented each season—they are perfected. A neckline
				is adjusted by millimeters. A seam is repositioned for better drape. This is the work of
				artisans, not algorithms.
			</p>

			<figure class="my-16">
				<div class="aspect-[4/3] bg-gray-50 border border-gray-200">
					<div class="w-full h-full flex items-center justify-center">
						<div class="text-center">
							<p class="text-sm text-gray-400 mb-2">[INLINE IMAGE]</p>
							<p class="text-xs text-gray-500">Atelier detail shot</p>
						</div>
					</div>
				</div>
				<figcaption class="text-xs text-gray-500 text-center mt-4">
					[Caption] Hand-finishing details at our Milan production facility
				</figcaption>
			</figure>

			<p class="text-base leading-relaxed text-gray-700 mb-8">
				[Closing Paragraph] So when you choose a piece from our collection, you are not buying into
				a trend. You are acquiring a small act of resistance—a garment designed to last, made by
				hands that care, for a body that deserves better than disposable fashion.
			</p>

			<p class="text-base leading-relaxed text-gray-700 mb-8">
				[Final Line] This is our manifesto. Welcome to the eternal summer.
			</p>
		</div>

		<div class="h-32"></div>

		<div class="border-t border-gray-200 pt-12 pb-16">
			<div class="flex gap-6">
				<div class="w-24 h-24 bg-gray-100 border border-gray-200 flex-shrink-0 rounded-full">
					<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">[Photo]</div>
				</div>
				<div>
					<h3 class="text-lg font-serif mb-2">{article.author}</h3>
					<p class="text-sm text-gray-600 leading-relaxed">
						Elena is the Creative Director and co-founder of Luxe Swim. She splits her time
						between Milan and the Amalfi Coast, drawing inspiration from Mediterranean
						architecture and the slow fashion movement.
					</p>
				</div>
			</div>
		</div>
	</article>

	<div class="h-32"></div>

	{#if featuredProducts.length > 0}
	<section class="border-t-2 border-gray-900 py-32 bg-gray-50">
		<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
			<div class="text-center mb-16">
				<h2 class="text-4xl md:text-5xl font-serif mb-4">Shop the Story</h2>
				<p class="text-sm text-gray-500">[Curated products featured in this editorial]</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-12">
				{#each featuredProducts as product (product.id)}
					<a href={`/product/${product.handle}`} class="group">
						<div class="aspect-[3/4] bg-white border border-gray-200 mb-4 relative overflow-hidden">
							<ProductMedia src={product.media[0]} poster={product.images[0]} alt={product.name} />
							<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
						</div>

						<div class="space-y-2">
							<h3 class="text-lg tracking-wide group-hover:opacity-70 transition-opacity">
								{product.name}
							</h3>
							<div class="flex items-center space-x-2">
								{#each product.colors.slice(0, 3) as color, idx (idx)}
									<div
										class="w-5 h-5 border border-gray-300 rounded-full"
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
		</div>
	</section>
	{/if}

	<div class="h-32"></div>

	<section class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-32">
		<h2 class="text-3xl font-serif mb-12">Continue Reading</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
			{#each relatedArticles as related (related.title)}
				<a href="/journal/1" class="group">
					<div class="aspect-video bg-gray-100 border border-gray-200 mb-4">
						<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">[Image]</div>
					</div>
					<span class="text-xs tracking-[0.3em] uppercase text-gray-500 block mb-2">
						{related.category}
					</span>
					<h3 class="text-xl font-serif group-hover:opacity-70 transition-opacity">
						{related.title}
					</h3>
				</a>
			{/each}
		</div>
	</section>
</div>
