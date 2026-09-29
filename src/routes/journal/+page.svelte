<script lang="ts">
	interface Article {
		id: string;
		title: string;
		category: string;
		excerpt: string;
		imageRatio: 'portrait' | 'square';
		date: string;
	}

	const articles: Article[] = [
		{
			id: '1',
			title: 'Mediterranean Mornings: The Art of Slow Summer',
			category: 'Travel',
			excerpt: 'Discover the coastal ritual of sunrise swims and sun-soaked terraces.',
			imageRatio: 'portrait',
			date: 'March 1, 2026'
		},
		{
			id: '2',
			title: 'The Architecture of Form: Italian Textile Heritage',
			category: 'Craft',
			excerpt: 'Inside the family atelier where our fabrics are woven.',
			imageRatio: 'square',
			date: 'February 28, 2026'
		},
		{
			id: '3',
			title: 'Poolside Philosophy: Conversations on Minimalism',
			category: 'Culture',
			excerpt: 'Why less truly becomes more in the language of luxury.',
			imageRatio: 'portrait',
			date: 'February 25, 2026'
		},
		{
			id: '4',
			title: 'The Color of Water: Our Spring Palette Inspiration',
			category: 'Design',
			excerpt: 'From azure depths to sandy neutrals, the story behind our hues.',
			imageRatio: 'square',
			date: 'February 20, 2026'
		}
	];

	const featuredArticle = {
		id: 'featured',
		title: 'The Eternal Summer: A Manifesto on Timeless Design',
		category: 'Philosophy',
		excerpt:
			'Why we reject fast fashion in favor of pieces designed to transcend seasons, trends, and time itself.',
		date: 'March 5, 2026'
	};
</script>

<div class="bg-white">
	<section class="relative h-[60vh] min-h-[500px] bg-gray-900 border-b-2 border-gray-900">
		<div class="absolute inset-0">
			<div class="w-full h-full flex items-center justify-center text-white/20">
				<div class="text-center">
					<p class="text-sm mb-2">[FEATURED HERO IMAGE]</p>
					<p class="text-xs">1920 x 800px | Editorial lifestyle</p>
				</div>
			</div>
		</div>

		<div class="relative z-10 h-full flex items-end">
			<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-16 w-full">
				<div class="max-w-2xl">
					<span class="text-xs tracking-[0.3em] uppercase text-white/80 mb-4 block">
						{featuredArticle.category}
					</span>
					<h1 class="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
						{featuredArticle.title}
					</h1>
					<p class="text-lg text-white/90 mb-8 leading-relaxed">
						{featuredArticle.excerpt}
					</p>
					<a
						href={`/journal/${featuredArticle.id}`}
						class="inline-block border-2 border-white text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-gray-900 transition-all"
					>
						Read the Story
					</a>
				</div>
			</div>
		</div>
	</section>

	<div class="h-32"></div>

	<section class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-32">
		<div class="mb-16">
			<h2 class="text-4xl md:text-5xl font-serif mb-4">Recent Stories</h2>
			<p class="text-sm text-gray-500">[Asymmetrical masonry grid]</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-12">
			{#each articles as article, index (article.id)}
				<a
					href={`/journal/${article.id}`}
					class="group {article.imageRatio === 'portrait' && index % 2 === 0 ? 'md:row-span-2' : ''}"
				>
					<div
						class="bg-gray-100 border border-gray-200 mb-6 relative overflow-hidden {article.imageRatio ===
						'portrait'
							? 'aspect-[3/4]'
							: 'aspect-square'}"
					>
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="text-center p-8">
								<p class="text-xs text-gray-400 mb-2">[{article.imageRatio.toUpperCase()} IMAGE]</p>
								<p class="text-xs text-gray-500">{article.title}</p>
								<p class="text-xs text-gray-400 mt-2">
									{article.imageRatio === 'portrait' ? '900 x 1200px' : '900 x 900px'}
								</p>
							</div>
						</div>
						<div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
					</div>

					<div class="space-y-3">
						<span class="text-xs tracking-[0.3em] uppercase text-gray-500">{article.category}</span>
						<h3 class="text-2xl font-serif leading-tight group-hover:opacity-70 transition-opacity">
							{article.title}
						</h3>
						<p class="text-sm text-gray-600 leading-relaxed">{article.excerpt}</p>
						<div class="flex items-center justify-between pt-4">
							<span class="text-xs text-gray-400">{article.date}</span>
							<span class="text-sm underline group-hover:opacity-70 transition-opacity">Read the Story</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<div class="h-32"></div>

	<section class="border-t-2 border-gray-900 py-32">
		<div class="max-w-2xl mx-auto px-8 text-center">
			<h2 class="text-4xl md:text-5xl font-serif mb-6">The Muse Letter</h2>
			<p class="text-lg text-gray-700 mb-12 leading-relaxed">
				Stories, insights, and the occasional love letter from our design studio. Subscribe to
				receive monthly dispatches.
			</p>

			<div class="max-w-md mx-auto">
				<div class="flex border-b-2 border-gray-900 pb-2 mb-4">
					<input
						type="email"
						placeholder="Your email address"
						class="flex-grow bg-transparent text-sm outline-none px-2"
					/>
					<button class="text-sm tracking-[0.2em] uppercase hover:opacity-70 transition-opacity">Subscribe</button>
				</div>
				<p class="text-xs text-gray-400">[WordPress newsletter block]</p>
			</div>
		</div>
	</section>
</div>
