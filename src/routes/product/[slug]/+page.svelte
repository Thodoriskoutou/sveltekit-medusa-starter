<script lang="ts">
	// Product detail page.
	//
	// `getProduct` is a remote function; awaiting it inside `$derived` works because
	// `compilerOptions.experimental.async` is enabled in vite.config.ts. The
	// <svelte:boundary> below is what renders while it is pending.
	import { page } from '$app/state'
	import { getProduct } from 'sveltekit-medusa-sdk'
	import * as Product from '$lib/components/ui/product'
	import * as Gallery from '$lib/components/ui/gallery'
	import { AddToCartButton } from '$lib/components/ui/cta'
	import { Metadata } from '$lib/components/ui/seo'

	// `+variants.inventory_quantity` lets the option buttons and add-to-cart button
	// know what is actually in stock.
	const product = $derived(await getProduct({ slug: page.params.slug, fields: '+variants.inventory_quantity' }))
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading…</div>
	{/snippet}

	{#snippet failed(error)}
		<div class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-2xl font-semibold">Product unavailable</h1>
			<p class="mt-2 text-muted-foreground">{error instanceof Error ? error.message : 'Please try again.'}</p>
		</div>
	{/snippet}

	{#if !product}
		<div class="mx-auto max-w-6xl px-4 py-12">
			<h1 class="text-2xl font-semibold">Product not found</h1>
			<a href="/" class="mt-2 inline-block underline">Back to home</a>
		</div>
	{:else}
		<Metadata config={{ title: product.title, description: product.description ?? undefined, image: product.thumbnail ?? undefined }} />

		<Product.Root {product}>
			<Product.JsonLd />

			<div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
				<Gallery.Root images={product.images ?? []} alt={product.title}>
					<Gallery.Main>
						<Gallery.Carousel>
							<Gallery.Image />
						</Gallery.Carousel>
						<Gallery.Dots class="mt-3" />
					</Gallery.Main>
					<Gallery.Thumbnails>
						<Gallery.ThumbnailImage />
					</Gallery.Thumbnails>
				</Gallery.Root>

				<div>
					<Product.Title class="text-3xl font-semibold tracking-tight" />
					<Product.Subtitle class="mt-1 text-muted-foreground" />
					<Product.Rating class="mt-3" />
					<Product.Price class="mt-4 block text-2xl" />

					{#each product.options ?? [] as option (option.id)}
						<div class="mt-6">
							<h2 class="text-sm font-medium">{option.title}</h2>
							<Product.Options class="mt-2">
								<Product.OptionButton {option} />
							</Product.Options>
						</div>
					{/each}

					<div class="mt-8 flex items-center gap-3">
						<Product.QuantitySelect />
						<AddToCartButton class="flex-1" />
					</div>

					<Product.Description class="prose prose-neutral mt-8 dark:prose-invert" />
				</div>
			</div>
		</Product.Root>
	{/if}
</svelte:boundary>
