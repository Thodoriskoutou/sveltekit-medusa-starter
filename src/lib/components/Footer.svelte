<script lang="ts">
	import { SITE_NAME } from '$app/env/public'

	// Rendered server-side too, so avoid `new Date()` drift by computing once.
	const year = new Date().getFullYear()
</script>

<footer class="mt-16 border-t">
	<div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
		<p>&copy; {year} {SITE_NAME}. All rights reserved.</p>
		<!-- Add your own links here. -->
		<nav class="flex gap-4" aria-label="Footer">
			<a href="/search" class="hover:text-foreground">Search</a>
			<a href="/account" class="hover:text-foreground">Account</a>
		</nav>
	</div>
</footer>
