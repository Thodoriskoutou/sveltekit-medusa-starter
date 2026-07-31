<script lang="ts">
	// Collection listing — the mirror of /category/[slug].
	import { page } from '$app/state'
	import { getCollection } from 'sveltekit-medusa-sdk'
	import * as Products from '$lib/components/ui/products'
	import { Metadata } from '$lib/components/ui/seo'

	const collection = $derived(await getCollection({ slug: page.params.slug }))
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading…</div>
	{/snippet}

	{#snippet failed(error)}
		<div class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-2xl font-semibold">Collection unavailable</h1>
			<p class="mt-2 text-muted-foreground">{error instanceof Error ? error.message : 'Please try again.'}</p>
		</div>
	{/snippet}

	{#if !collection}
		<div class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-2xl font-semibold">Collection not found</h1>
			<a href="/" class="mt-2 inline-block underline">Back to home</a>
		</div>
	{:else}
		<Metadata config={{ title: collection.title }} />

		<section class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-3xl font-semibold tracking-tight">{collection.title}</h1>

			<div class="mt-8">
				<Products.Root collectionId={collection.id} pageSize={12} href={p => `/product/${p.handle}`}>
					{#snippet children({ count })}
						{#if count === 0}
							<p class="text-muted-foreground">No products in this collection yet.</p>
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
