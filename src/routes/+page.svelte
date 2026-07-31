<script lang="ts">
	// Home page: browse by category.
	// `Categories.Root` fetches and paginates on its own; `href` is overridden because
	// this app routes categories at /category/[slug] rather than the registry default.
	import * as Categories from '$lib/components/ui/categories'
	import { Metadata } from '$lib/components/ui/seo'
</script>

<Metadata config={{ title: 'Home', description: 'Shop our latest products.' }} />

<section class="mx-auto max-w-6xl px-4 py-12">
	<h1 class="text-3xl font-semibold tracking-tight">Shop by category</h1>
	<p class="mt-2 text-muted-foreground">A starting point — replace this with your own hero and featured products.</p>

	<div class="mt-8">
		<Categories.Root pageSize={12} href={c => `/category/${c.handle}`}>
			{#snippet children({ loading })}
				{#if loading}
					<p class="text-muted-foreground">Loading categories…</p>
				{:else}
					<Categories.Grid>
						{#snippet empty()}
							<p class="text-muted-foreground">No categories yet. Create some in the Medusa admin.</p>
						{/snippet}
					</Categories.Grid>
					<div class="mt-8">
						<Categories.Pagination />
					</div>
				{/if}
			{/snippet}
		</Categories.Root>
	</div>
</section>
