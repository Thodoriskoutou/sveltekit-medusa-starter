<script lang="ts">
	import { photos } from '$lib/site';
</script>

<div class="relative h-screen w-full bg-gray-900 flex items-center justify-center overflow-hidden">
	<img
		src={photos.notFound}
		alt="The Aegean horizon from a white arch"
		class="absolute inset-0 h-full w-full object-cover object-[50%_65%]"
	/>

	<div class="absolute inset-0 bg-black/45"></div>

	<div class="relative z-10 text-center px-8 max-w-3xl">
		<h1 class="text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight italic">
			The Muse is Lost
		</h1>

		<p class="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
			The horizon you are looking for is currently out of reach.
		</p>

		<a
			href="/shop"
			class="inline-block border-2 border-white text-white px-12 py-4 text-sm tracking-[0.3em] uppercase hover:bg-white hover:text-gray-900 transition-all"
		>
			Return to the Collection
		</a>

		<p class="text-xs text-white/50 mt-12 tracking-[0.3em] uppercase">Error 404</p>
	</div>
</div>
