<script lang="ts">
	import logoBlack from '$lib/assets/logo-black.png';
	import logoWhite from '$lib/assets/logo-white.png';

	interface Props {
		variant?: 'normal' | 'reverse';
		class?: string;
		width?: number;
		height?: number;
	}

	let { variant = 'normal', class: className = '', width = 280, height = 80 }: Props = $props();

	let logoSrc = $derived(variant === 'reverse' ? logoWhite : logoBlack);
</script>

<img
	src={logoSrc}
	alt="Wild Coral - Luxury Aesthetic Swimwear"
	class="transition-opacity duration-300 {className}"
	{width}
	{height}
	style="width: auto; height: auto; max-width: {width}px"
/>
