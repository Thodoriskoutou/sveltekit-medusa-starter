<script lang="ts">
	// The reviews section of a product page: rating summary, the reviews, and, for customers who bought
	// and received the piece, a form to write one. Data comes from the product-reviews plugin in Medusa.
	import { getProductReviews, getReviewableItems } from '$lib/medusa/reviews.remote';
	import { formatAverage, type ReviewStats } from '$lib/medusa/reviews';
	import { safe } from '$lib/medusa/safe';
	import { site } from '$lib/site';
	import { dev } from '$app/env';
	import StarRating from './StarRating.svelte';
	import ReviewForm from './ReviewForm.svelte';

	let {
		productId,
		stats,
		onchange
	}: { productId: string; stats: ReviewStats | null; /** Called after a review is saved, so the page can refresh its rating summary. */ onchange?: () => void | Promise<void> } = $props();

	const PAGE = 5;
	let limit = $state(PAGE);
	let sort = $state<'newest' | 'highest' | 'lowest'>('newest');
	let ratingFilter = $state<number | null>(null);

	// Start over from the top when moving to a different product (the page component is reused).
	$effect(() => {
		void productId;
		limit = PAGE;
		sort = 'newest';
		ratingFilter = null;
	});

	const args = $derived({ productId, limit, sort, ...(ratingFilter ? { rating: ratingFilter } : {}) });
	const list = $derived(await safe(() => getProductReviews(args)));
	const eligibility = $derived(await safe(() => getReviewableItems({ productId })));

	const reviews = $derived(list.data?.reviews ?? []);
	const count = $derived(list.data?.count ?? 0);
	const reviewable = $derived(eligibility.data?.items ?? []);
	const signedIn = $derived(eligibility.data?.signedIn ?? false);

	const fmtDate = (d: string) => new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });

	async function refreshAfterSave() {
		await Promise.all([getReviewableItems({ productId }).refresh(), getProductReviews(args).refresh(), onchange?.()]);
	}

	const showForm = $derived(reviewable.length > 0);
</script>

<section id="reviews" class="mx-auto max-w-4xl scroll-mt-24 border-t border-gray-200 px-8 py-16 md:px-16">
	<h2 class="mb-12 text-center text-3xl tracking-wide md:text-4xl">Reviews</h2>

	{#if stats}
		<div class="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
			<div class="text-center md:text-left">
				<p class="font-serif text-6xl">{formatAverage(stats.average)}</p>
				<StarRating value={stats.average} size="lg" class="mt-2" />
				<p class="mt-2 text-sm text-gray-600">Based on {stats.count} {stats.count === 1 ? 'review' : 'reviews'}</p>
			</div>
			<ul class="space-y-2" aria-label="Filter reviews by rating">
				{#each [5, 4, 3, 2, 1] as star (star)}
					{@const n = stats.distribution[star - 1]}
					<li>
						<button
							type="button"
							class="group flex w-full items-center gap-3 text-sm {ratingFilter === star ? 'font-medium' : ''}"
							aria-pressed={ratingFilter === star}
							onclick={() => {
								ratingFilter = ratingFilter === star ? null : star;
								limit = PAGE;
							}}
						>
							<span class="w-10 text-left text-gray-700">{star} star</span>
							<span class="h-2 flex-1 bg-gray-200">
								<span class="block h-full bg-gray-900" style="width: {(n / stats.count) * 100}%"></span>
							</span>
							<span class="w-6 text-right text-gray-600">{n}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if list.error}
		<p class="text-center text-sm text-gray-600">{dev ? list.error : 'Reviews could not be loaded right now.'}</p>
	{:else if reviews.length === 0}
		<p class="text-center text-sm text-gray-600">
			{ratingFilter ? `No ${ratingFilter}-star reviews yet.` : 'No reviews yet.'}
		</p>
	{:else}
		<div class="mb-6 flex items-center justify-between gap-4 text-sm">
			<p class="text-gray-600">
				{ratingFilter ? `${ratingFilter}-star reviews: ` : ''}{count} {count === 1 ? 'review' : 'reviews'}
			</p>
			<label class="flex items-center gap-2 text-gray-600">
				<span>Sort by</span>
				<select bind:value={sort} class="border border-gray-300 bg-white px-3 py-2 text-gray-900">
					<option value="newest">Newest</option>
					<option value="highest">Highest rated</option>
					<option value="lowest">Lowest rated</option>
				</select>
			</label>
		</div>

		<ul class="divide-y divide-gray-200 border-y border-gray-200">
			{#each reviews as review (review.id)}
				<li class="py-8">
					<div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
						<StarRating value={review.rating} size="sm" />
						<span class="text-sm">{review.author}</span>
						<span class="text-xs text-gray-500">{fmtDate(review.createdAt)}</span>
					</div>
					<p class="whitespace-pre-line text-sm leading-relaxed text-gray-700">{review.content}</p>
					{#if review.images.length}
						<div class="mt-4 flex gap-3">
							{#each review.images as src (src)}
								<img {src} alt="Photo from {review.author}'s review" loading="lazy" class="h-24 w-20 border border-gray-200 object-cover" />
							{/each}
						</div>
					{/if}
					{#if review.response}
						<div class="mt-4 border-l-2 border-gray-900 bg-gray-50 p-4 text-sm">
							<p class="mb-1 text-xs uppercase tracking-wider text-gray-500">Reply from {site.name}</p>
							<p class="whitespace-pre-line leading-relaxed text-gray-700">{review.response}</p>
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		{#if reviews.length < count}
			<div class="mt-8 text-center">
				<button
					type="button"
					onclick={() => (limit += PAGE)}
					class="border-2 border-gray-900 px-8 py-3 text-sm uppercase tracking-[0.2em] transition-all hover:bg-gray-900 hover:text-white"
				>
					Show more reviews
				</button>
			</div>
		{/if}
	{/if}

	<div class="mt-12">
		{#if showForm}
			<ReviewForm {productId} items={reviewable} onsaved={refreshAfterSave} />
		{:else if !signedIn}
			<p class="text-center text-sm text-gray-600">
				Bought this piece? <a href="?auth=login" class="underline transition-opacity hover:opacity-70">Sign in</a> to write a review.
			</p>
		{:else}
			<p class="text-center text-sm text-gray-600">Reviews can be written by customers who have received this piece.</p>
		{/if}
	</div>
</section>
