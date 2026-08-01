<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { buttonVariants } from '$lib/components/ui/button/index.js'
	import type { Snippet } from 'svelte'

	let { href = '?auth=login', class: className = '', children }: { href?: string; class?: string; children?: Snippet } = $props()
</script>

<a {href} class={cn(buttonVariants({ variant: 'default' }), className)}>
	{#if children}{@render children()}{:else}Sign in{/if}
</a>
