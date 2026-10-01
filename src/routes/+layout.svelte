<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getCart, getProductCategoriesQuery, getContentItems } from 'sveltekit-medusa-sdk';
	import { SITE_NAME, SITE_URL } from '$app/env/public';
	import { MetaProvider } from '$lib/components/ui/seo';
	import * as Auth from '$lib/components/ui/auth';
	import { site } from '$lib/site';
	import SocialIcon, { type SocialNetwork } from '$lib/components/icons/SocialIcon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Search from '@lucide/svelte/icons/search';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import User from '@lucide/svelte/icons/user';

	let { children } = $props();

	// Owner settings from src/lib/site.ts: empty values simply hide the matching link.
	const contactHref = site.contactEmail ? `mailto:${site.contactEmail}` : '/customer-care';
	// Social icons: a URL makes a link, '' shows the icon dimmed until the link is added, and a
	// network that isn't in site.social isn't shown (see src/lib/site.ts).
	const socialNetworks = Object.entries(site.social) as [SocialNetwork, string][];
	const networkLabel = (network: string) => network.charAt(0).toUpperCase() + network.slice(1);

	// Header badge: read without awaiting so the header never blocks rendering (or fails) if Medusa
	// is unreachable. `addToCart` and the other cart commands update this same query in place.
	const cartQuery = getCart();
	const cartCount = $derived(cartQuery.current?.items?.reduce((n, item) => n + item.quantity, 0) ?? 0);

	// Menu + footer "Shop" links come from the categories managed in the Medusa admin (top level
	// only, in the admin's rank order). Also read without awaiting, for the same reason as the cart.
	const categoriesQuery = getProductCategoriesQuery({ limit: 50, fields: 'id,name,handle,rank,parent_category_id' });
	const shopCategories = $derived(
		(categoriesQuery.current?.product_categories ?? [])
			.filter((c) => !c.parent_category_id)
			.slice()
			.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
	);

	// The three newest Journal posts for the menu and footer. Read without awaiting, so a missing
	// collection or an unreachable Medusa just leaves the "All Stories" link on its own.
	const journalQuery = getContentItems({ slug: site.journalCollection, limit: 3 });
	const latestStories = $derived(
		(journalQuery.current?.content_items ?? [])
			.slice()
			.sort((a, b) => Date.parse(b.published_at ?? b.created_at) - Date.parse(a.published_at ?? a.created_at))
	);

	let scrolled = $state(false);
	let scrollOpacity = $state(0);
	let menuOpen = $state(false);
	let searchOpen = $state(false);
	let searchQuery = $state('');

	let isHomePage = $derived(page.url.pathname === '/');

	$effect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			scrolled = scrollY > 50;
			scrollOpacity = Math.min(scrollY / 200, 1);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
			searchOpen = false;
			searchQuery = '';
		}
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
		if (!menuOpen) searchOpen = false;
	}

	function toggleSearch() {
		searchOpen = !searchOpen;
		if (!searchOpen) menuOpen = false;
	}

	let headerLight = $derived(isHomePage && !menuOpen && scrollOpacity < 0.5);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<MetaProvider site={{ siteName: SITE_NAME, siteUrl: SITE_URL, titleTemplate: `%s | ${SITE_NAME}` }}>
<div class="min-h-screen bg-white flex flex-col">
	<ScrollProgressBar />

	<header
		class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {menuOpen
			? 'bg-white border-b-2 border-gray-900'
			: scrolled && isHomePage
				? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50'
				: isHomePage
					? 'bg-transparent'
					: 'bg-white border-b-2 border-gray-900'}"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="hidden md:flex items-center justify-between py-6">
				<button
					onclick={toggleMenu}
					class="p-2 hover:opacity-70 transition-all duration-300 {headerLight
						? 'text-white'
						: 'text-gray-900'}"
				>
					{#if menuOpen}
						<X class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
					<span class="sr-only">Menu</span>
				</button>

				<a href="/" class="absolute left-1/2 transform -translate-x-1/2">
					<Logo variant={headerLight ? 'reverse' : 'normal'} width={240} />
				</a>

				<div
					class="flex items-center space-x-6 transition-all duration-300 {headerLight
						? 'text-white'
						: 'text-gray-900'}"
				>
					<button onclick={toggleSearch} class="hover:opacity-70 transition-opacity">
						<Search class="w-5 h-5" />
						<span class="sr-only">Search</span>
					</button>
					<a href="/account" class="hover:opacity-70 transition-opacity">
						<User class="w-5 h-5" />
						<span class="sr-only">Account</span>
					</a>
					<a href="/cart" class="relative hover:opacity-70 transition-opacity">
						<ShoppingBag class="w-5 h-5" />
						{#if cartCount > 0}
							<span
								class="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
							>
								{cartCount}
							</span>
						{/if}
						<span class="sr-only">Cart</span>
					</a>
				</div>
			</div>

			<div class="md:hidden flex items-center justify-between py-4">
				<button
					onclick={toggleMenu}
					class="p-2 hover:opacity-70 transition-all duration-300 {headerLight
						? 'text-white'
						: 'text-gray-900'}"
				>
					{#if menuOpen}
						<X class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
					<span class="sr-only">Menu</span>
				</button>

				<a href="/" class="flex-1 flex justify-center">
					<Logo variant={headerLight ? 'reverse' : 'normal'} width={160} />
				</a>

				<a
					href="/cart"
					class="relative p-2 hover:opacity-70 transition-all duration-300 {headerLight
						? 'text-white'
						: 'text-gray-900'}"
				>
					<ShoppingBag class="w-5 h-5" />
					{#if cartCount > 0}
						<span
							class="absolute top-0 right-0 bg-gray-900 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
						>
							{cartCount}
						</span>
					{/if}
					<span class="sr-only">Cart</span>
				</a>
			</div>
		</div>

		{#if searchOpen}
			<div class="border-t border-gray-200 bg-white">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<form onsubmit={handleSearch} class="max-w-2xl mx-auto">
						<div class="flex items-center border-b-2 border-gray-900 pb-2">
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search for swimwear, styles, or stories..."
								class="flex-grow bg-transparent text-lg outline-none px-2"
								autofocus
							/>
							<button
								type="submit"
								class="text-sm tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
							>
								Search
							</button>
						</div>
						<p class="text-xs text-gray-400 mt-4">
							Try searching: "bikini", "one piece", "white", or "resort"
						</p>
					</form>
				</div>
			</div>
		{/if}
	</header>

	{#if menuOpen}
		<div class="fixed inset-0 z-40 bg-white pt-16 md:pt-20 overflow-y-auto">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-12">
					<div>
						<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Shop</h3>
						<ul class="space-y-4">
							<li>
								<a
									href="/shop"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									All Swimwear
								</a>
							</li>
							{#each shopCategories as cat (cat.id)}
								<li>
									<a
										href={`/shop?category=${cat.handle}`}
										class="text-lg hover:opacity-70 transition-opacity"
										onclick={() => (menuOpen = false)}
									>
										{cat.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>

					<div>
						<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Journal</h3>
						<ul class="space-y-4">
							<li>
								<a
									href="/journal"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									All Stories
								</a>
							</li>
							{#each latestStories as story (story.id)}
								<li>
									<a
										href={`/journal/${story.slug}`}
										class="text-lg hover:opacity-70 transition-opacity"
										onclick={() => (menuOpen = false)}
									>
										{story.title}
									</a>
								</li>
							{/each}
						</ul>
					</div>

					<div>
						<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Customer Care</h3>
						<ul class="space-y-4">
							<li>
								<a
									href="/customer-care"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									Size Guide
								</a>
							</li>
							<li>
								<a
									href="/customer-care"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									Shipping & Returns
								</a>
							</li>
							<li>
								<a href={contactHref} class="text-lg hover:opacity-70 transition-opacity" onclick={() => (menuOpen = false)}>Contact Us</a>
							</li>
							<li>
								<a href="/account#orders" class="text-lg hover:opacity-70 transition-opacity" onclick={() => (menuOpen = false)}>Track Order</a>
							</li>
						</ul>
					</div>

					<div>
						<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Account</h3>
						<ul class="space-y-4">
							<li>
								<a
									href="/account"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									My Account
								</a>
							</li>
							<li>
								<a
									href="/account"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									Recent Orders
								</a>
							</li>
							<li>
								<a
									href="/account"
									class="text-lg hover:opacity-70 transition-opacity"
									onclick={() => (menuOpen = false)}
								>
									Saved for Later
								</a>
							</li>
							<li>
								<a href="?auth=login" class="text-lg hover:opacity-70 transition-opacity" onclick={() => (menuOpen = false)}>Sign In / Register</a>
							</li>
						</ul>
					</div>
				</div>

				<div class="mt-16 pt-16 border-t border-gray-200">
					<div class="max-w-2xl">
						<h3 class="text-3xl font-serif mb-4">Discover the Journal</h3>
						<p class="text-gray-600 mb-6">
							Stories of slow summer, craftsmanship, and the philosophy behind timeless design.
						</p>
						<a
							href="/journal"
							class="inline-block border-2 border-gray-900 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-900 hover:text-white transition-all"
							onclick={() => (menuOpen = false)}
						>
							Read Now
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<main class={isHomePage ? '' : 'pt-20'}>
		{@render children()}
	</main>

	<footer class="bg-white border-t border-gray-200 mt-auto">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div class="flex justify-center mb-12">
				<Logo variant="normal" width={240} />
			</div>

			<div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
				<div>
					<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Shop</h3>
					<ul class="space-y-3 text-sm text-gray-600">
						<li><a href="/shop" class="hover:text-gray-900 transition-colors">All Swimwear</a></li>
						{#each shopCategories as cat (cat.id)}
							<li>
								<a href={`/shop?category=${cat.handle}`} class="hover:text-gray-900 transition-colors">
									{cat.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Journal</h3>
					<ul class="space-y-3 text-sm text-gray-600">
						<li><a href="/journal" class="hover:text-gray-900 transition-colors">All Stories</a></li>
						{#each latestStories as story (story.id)}
							<li>
								<a href={`/journal/${story.slug}`} class="hover:text-gray-900 transition-colors">{story.title}</a>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Support</h3>
					<ul class="space-y-3 text-sm text-gray-600">
						<li>
							<a href="/customer-care" class="hover:text-gray-900 transition-colors">Size Guide</a>
						</li>
						<li>
							<a href="/customer-care" class="hover:text-gray-900 transition-colors">
								Shipping & Returns
							</a>
						</li>
						<li><a href={contactHref} class="hover:text-gray-900 transition-colors">Contact Us</a></li>
						<li>
							<a href="/account" class="hover:text-gray-900 transition-colors">My Account</a>
						</li>
					</ul>
				</div>

				<div>
					<h3 class="text-xs tracking-[0.2em] uppercase mb-6 text-gray-900">Follow Us</h3>
					<div class="flex items-center gap-5">
						{#each socialNetworks as [network, url] (network)}
							{#if url}
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={networkLabel(network)}
									class="text-gray-700 hover:text-gray-900 hover:opacity-70 transition-all"
								>
									<SocialIcon name={network} class="w-6 h-6" />
								</a>
							{:else}
								<span class="text-gray-300" title={networkLabel(network)}>
									<SocialIcon name={network} class="w-6 h-6" />
								</span>
							{/if}
						{/each}
					</div>
					{#if site.instagramHandle}
						<p class="text-xs text-gray-400 mt-3">{site.instagramHandle}</p>
					{/if}
				</div>
			</div>

			<div
				class="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500"
			>
				<p>© {new Date().getFullYear()} {site.name.toUpperCase()}. All rights reserved.</p>
			</div>
		</div>
	</footer>

	<CookieConsent />
</div>

<!-- Opens on ?auth=login|register|forgot|reset. Mount once, here. -->
<Auth.Dialog />
</MetaProvider>
