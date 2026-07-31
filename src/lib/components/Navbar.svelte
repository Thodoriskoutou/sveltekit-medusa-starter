<script lang="ts">
	// Site header: logo, search, theme, account, cart.
	// Every commerce control here is a registry component you own a copy of under
	// $lib/components/ui — edit them directly rather than wrapping them.
	import { SITE_NAME } from '$app/env/public'
	import * as Customer from '$lib/components/ui/customer'
	import { CartDrawer } from '$lib/components/ui/cart'
	import SearchBox from '$lib/components/ui/search/search-box.svelte'
	import ThemeButton from '$lib/components/ui/theme/theme-button.svelte'
	import UserIcon from '@lucide/svelte/icons/circle-user-round'
</script>

<header class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<nav class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4" aria-label="Main">
		<!-- Replace with an <img> or inline SVG logo. -->
		<a href="/" class="shrink-0 text-lg font-semibold tracking-tight">{SITE_NAME}</a>

		<div class="ml-auto flex min-w-0 flex-1 justify-end">
			<SearchBox searchUrl="/search" class="w-full max-w-xs" />
		</div>

		<div class="flex shrink-0 items-center gap-1">
			<ThemeButton />

			<Customer.SignedOut>
				<Customer.SignInButton />
			</Customer.SignedOut>

			<Customer.SignedIn>
				<Customer.Menu>
					<Customer.MenuTrigger class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent">
						<UserIcon class="size-5" />
						<span class="sr-only">Account menu</span>
					</Customer.MenuTrigger>
					<Customer.MenuContent>
						<Customer.MenuItem href="/account">Account</Customer.MenuItem>
						<Customer.SignOut>Sign out</Customer.SignOut>
					</Customer.MenuContent>
				</Customer.Menu>
			</Customer.SignedIn>

			<CartDrawer lineHref={item => `/product/${item.product_handle}`} />
		</div>
	</nav>
</header>
