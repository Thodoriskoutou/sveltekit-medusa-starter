<script lang="ts">
	// Full-page search. `Search.Results static` lays results out in flow rather than as
	// the floating dropdown the navbar's SearchBox uses, and `query` seeds the term from
	// the URL so /search?q=… works on load and on client-side navigation.
	//
	// Requires medusa-plugin-search on the backend; without it the results stay empty.
	import { page } from '$app/state'
	import * as Search from '$lib/components/ui/search'
	import type { SearchHit } from '$lib/components/ui/search/ctx.svelte.js'
	import { Metadata } from '$lib/components/ui/seo'

	const q = $derived(page.url.searchParams.get('q') ?? '')

	// The registry routes hits at /categories/… and /collections/…; this app uses the
	// singular forms, so map them here.
	function hitHref(hit: SearchHit) {
		if (hit.type === 'category') return `/category/${hit.slug}`
		if (hit.type === 'collection') return `/collection/${hit.slug}`
		return `/product/${hit.slug}`
	}
</script>

<Metadata config={{ title: q ? `Search: ${q}` : 'Search', noindex: true }} />

<section class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-semibold tracking-tight">Search</h1>

	<Search.Root query={q} class="mt-6">
		<Search.Input placeholder="Search products…" />
		<Search.Results static href={hitHref} class="mt-6" />
	</Search.Root>
</section>
