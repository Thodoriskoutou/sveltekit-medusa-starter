<script lang="ts">
	import * as Search from '$lib/components/ui/search'
</script>

<Search.Root class="relative mx-auto hidden w-full max-w-xl md:block">
	<Search.Input />
	<Search.Results />
</Search.Root>

<div class="ml-auto flex justify-end md:hidden">
	<a href="/search">
		<Search.Icon class="grow-on-hover size-8" />
	</a>
</div>
