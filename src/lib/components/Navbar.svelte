<script lang="ts">
	import { SITE_NAME } from '$app/env/public'
	import Cart from './Cart.svelte'
	import Customer from './Customer.svelte'
	import Search from './Search.svelte'
	import ThemeButton from '$lib/components/ui/theme/theme-button.svelte'
</script>

<header class="bg-transparent px-4 sm:px-6 lg:px-8">
	<nav class="mx-auto mt-3 flex h-16 max-w-7xl grow items-center justify-between gap-4 md:gap-4" aria-label="Main">
		<div class="flex flex-none items-center gap-2">
			<!-- Replace with an <img> or inline SVG logo. -->
			<a href="/" class="shrink-0 text-2xl font-semibold tracking-tight">{SITE_NAME}</a>
			<div class="hidden lg:ml-4 lg:block">test</div>
		</div>

		<div class="grow">
			<Search />
		</div>

		<div class="flex flex-none items-center justify-end gap-4">
			<!-- <div class="lg:hidden"><SideBar {collections} /></div> -->
			<div class="hidden items-center md:flex">
				<ThemeButton />
			</div>
			<div class="hidden items-center md:flex">
				<Customer />
			</div>
			<Cart lineHref={item => `/product/${item.product_handle}`} />
		</div>
	</nav>
</header>
