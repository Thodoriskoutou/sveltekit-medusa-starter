<script lang="ts">
	import { SITE_NAME } from '$app/env/public'
	import * as Search from '$lib/components/ui/search'
	import SearchDialog from '$lib/components/ui/search/search-dialog.svelte'

	// Rendered server-side too, so avoid `new Date()` drift by computing once.
	const year = new Date().getFullYear()
</script>

<footer class="mt-16 border-t bg-transparent px-4 sm:px-6 lg:px-8">
	<div class="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-2 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
		<p>&copy; {year} {SITE_NAME}. All rights reserved.</p>

		<div class="hidden md:flex">
			<SearchDialog>
				{#snippet trigger(open)}
					<button
						type="button"
						onclick={open}
						class="text-foreground bg-muted hover:bg-muted/70 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5"
					>
						<Search.Icon class="size-4" />
						<span>Ctrl + K</span>
					</button>
				{/snippet}
			</SearchDialog>
		</div>

		<!-- Add your own links here. -->
		<nav class="flex gap-4" aria-label="Footer">
			<a href="/search" class="hover:text-foreground">Terms</a>
			<a href="/search" class="hover:text-foreground">Privacy</a>
			<a href="/account" class="hover:text-foreground">Account</a>
		</nav>
	</div>
</footer>
