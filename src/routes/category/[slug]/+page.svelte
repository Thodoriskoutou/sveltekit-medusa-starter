<script lang="ts">
	// Category listing.
	//
	// `Products.Root` filters by category *id*, not handle, so the category is resolved
	// from the URL slug first. Same shape as /collection/[slug].
	import { page } from '$app/state'
	import { getProductCategory } from 'sveltekit-medusa-sdk'
	import * as Products from '$lib/components/ui/products'
	import { Metadata } from '$lib/components/ui/seo'

	const category = $derived(await getProductCategory({ slug: page.params.slug }))
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading…</div>
	{/snippet}

	{#snippet failed(error)}
		<div class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-2xl font-semibold">Category unavailable</h1>
			<p class="mt-2 text-muted-foreground">{error instanceof Error ? error.message : 'Please try again.'}</p>
		</div>
	{/snippet}

	{#if !category}
		<div class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-2xl font-semibold">Category not found</h1>
			<a href="/" class="mt-2 inline-block underline">Back to home</a>
		</div>
	{:else}
		<Metadata config={{ title: category.name, description: category.description ?? undefined }} />

		<section class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-3xl font-semibold tracking-tight">{category.name}</h1>
			{#if category.description}
				<p class="mt-2 text-muted-foreground">{category.description}</p>
			{/if}

			<div class="mt-8">
				<Products.Root categoryId={category.id} pageSize={12} href={p => `/product/${p.handle}`}>
					{#snippet children({ count })}
						{#if count === 0}
							<p class="text-muted-foreground">No products in this category yet.</p>
						{:else}
							<Products.Grid />
							<div class="mt-8">
								<Products.Pagination />
							</div>
						{/if}
					{/snippet}
				</Products.Root>
			</div>
		</section>
	{/if}
</svelte:boundary>
