<script lang="ts">
	interface Props {
		message?: string;
		exploreAllLink?: string;
	}

	let {
		message = 'No silhouettes match your current selection',
		exploreAllLink = '/shop'
	}: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-32 px-8 text-center">
	<p class="text-2xl font-serif italic text-gray-600 mb-8 max-w-md">
		{message}
	</p>

	<a
		href={exploreAllLink}
		class="py-4 px-10 border border-gray-900 text-sm tracking-[0.2em] uppercase font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
	>
		Explore All
	</a>
</div>
