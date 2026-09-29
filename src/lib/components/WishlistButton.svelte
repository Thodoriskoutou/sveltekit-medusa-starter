<script lang="ts">
	import Heart from '@lucide/svelte/icons/heart';

	interface Props {
		productId: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'icon' | 'text';
		class?: string;
		initialSaved?: boolean;
	}

	let {
		productId,
		size = 'md',
		variant = 'icon',
		class: className = '',
		initialSaved = false
	}: Props = $props();

	let isSaved = $state(initialSaved);

	const handleToggle = () => {
		isSaved = !isSaved;
		console.log(isSaved ? `Added ${productId} to wishlist` : `Removed ${productId} from wishlist`);
	};

	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};
</script>

{#if variant === 'text'}
	<button
		onclick={handleToggle}
		class="flex items-center gap-2 text-sm tracking-wide uppercase transition-colors {isSaved
			? 'text-red-600'
			: 'text-gray-900 hover:text-red-600'} {className}"
		aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
	>
		<Heart class="{sizes[size]} transition-all {isSaved ? 'fill-red-600' : 'fill-none'}" />
		<span>{isSaved ? 'Saved' : 'Save for Later'}</span>
	</button>
{:else}
	<button
		onclick={handleToggle}
		class="border-2 transition-all {isSaved
			? 'border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700'
			: 'border-gray-900 bg-white hover:bg-gray-900 hover:text-white'} {size === 'sm'
			? 'p-2'
			: size === 'lg'
				? 'p-4'
				: 'p-3'} {className}"
		aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
	>
		<Heart class="{sizes[size]} transition-all {isSaved ? 'fill-white' : 'fill-none'}" />
	</button>
{/if}
