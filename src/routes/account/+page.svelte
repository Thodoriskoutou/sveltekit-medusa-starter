<script lang="ts">
	// Account: the Wild Coral account pages, on the customer's real Medusa data.
	//
	// Signed out → the split sign-in / register screen (the registry's auth forms, styled to the
	// design). Signed in → welcome, orders, profile and saved addresses. The customer is read with
	// `getCustomer()`; the auth forms refresh that query on success, so the page swaps views on its own.
	import { getCustomer, updateCustomer, getOrders, getAddresses, deleteAddress } from 'sveltekit-medusa-sdk';
	import * as Auth from '$lib/components/ui/auth';
	import { logout } from 'sveltekit-medusa-sdk/auth';
	import { Metadata } from '$lib/components/ui/seo';
	import { formatPrice } from '$lib/medusa/catalog';
	import { safe } from '$lib/medusa/safe';
	import { dev } from '$app/env';
	import ProductMedia from '$lib/components/ProductMedia.svelte';

	// Wireframe styling for the registry's form parts.
	const labelClass = 'text-xs tracking-[0.2em] uppercase block mb-2 text-gray-700';
	const inputClass =
		'w-full border-2 border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors';
	const submitClass =
		'w-full bg-gray-900 text-white py-4 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-all';

	type Mode = 'login' | 'register' | 'forgot';
	let mode = $state<Mode>('login');
	let forgotSent = $state(false);

	// One request round: the customer first, then (only if signed in) orders and addresses in
	// parallel. Orders/addresses fail independently, so a hiccup there doesn't hide the account.
	const account = $derived(
		await safe(async () => {
			const customer = await getCustomer();
			if (!customer) return { customer: null, orders: null, addresses: null };
			const [orders, addresses] = await Promise.all([safe(() => getOrders()), safe(() => getAddresses())]);
			return { customer, orders, addresses };
		})
	);
	const customer = $derived(account.data?.customer ?? null);
	const ordersResult = $derived(account.data?.orders ?? { data: null, error: null });
	const addressesResult = $derived(account.data?.addresses ?? { data: null, error: null });
	const orders = $derived(ordersResult.data ?? []);
	const addresses = $derived(addressesResult.data ?? []);

	const displayName = $derived(
		[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.email?.split('@')[0] || ''
	);

	// Profile editing
	let editing = $state(false);
	let saving = $state(false);
	let profileMessage = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');

	function startEditing() {
		firstName = customer?.first_name ?? '';
		lastName = customer?.last_name ?? '';
		phone = customer?.phone ?? '';
		profileMessage = '';
		editing = true;
	}

	async function saveProfile(e: SubmitEvent) {
		e.preventDefault();
		if (saving) return;
		saving = true;
		profileMessage = '';
		try {
			await updateCustomer({ first_name: firstName, last_name: lastName, phone });
			await getCustomer().refresh();
			editing = false;
		} catch {
			profileMessage = 'Could not save your details. Please try again.';
		} finally {
			saving = false;
		}
	}

	async function removeAddress(id: string) {
		try {
			await deleteAddress(id);
			await getAddresses().refresh();
		} catch {
			/* leave the list as is */
		}
	}

	let signingOut = $state(false);
	async function signOut() {
		if (signingOut) return;
		signingOut = true;
		try {
			await logout();
			await getCustomer().refresh();
			mode = 'login';
		} finally {
			signingOut = false;
		}
	}

	const statusLabel = (s: string | undefined) => (s ? s.replace(/_/g, ' ') : '');
	const fmtDate = (d: string | Date) =>
		new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
</script>

<Metadata config={{ title: 'Account', noindex: true }} />

{#if !customer}
	<div class="min-h-screen bg-white">
		<div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
			<div class="relative bg-gray-900 min-h-[50vh] lg:min-h-screen">
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-center text-white/20">
						<p class="text-sm mb-2">[LIFESTYLE IMAGE]</p>
						<p class="text-xs">1200 x 1600px</p>
						<p class="text-xs mt-4">Serene poolside moment</p>
					</div>
				</div>
				<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
					<div class="text-white max-w-md">
						<h2 class="text-3xl font-serif mb-4 leading-tight">Your Personal Sanctuary</h2>
						<p class="text-sm leading-relaxed opacity-90">
							Access your orders and details — all in one place.
						</p>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-center p-8 lg:p-16">
				<div class="w-full max-w-md">
					<!-- No usable customer: signed out, an expired session, or Medusa unreachable. Signing in
					     again recovers the first two; the dev note explains the third. -->
					{#if dev && account.error}
						<p class="text-xs text-gray-400 mb-8">Dev note: {account.error}</p>
					{/if}
					{#if mode === 'login'}
						<h1 class="text-4xl font-serif mb-2">Welcome Back</h1>
						<p class="text-sm text-gray-600 mb-12">Sign in to your account</p>

						<Auth.LoginForm class="space-y-6">
							<Auth.Field name="email">
								<Auth.Label class={labelClass}>Email Address</Auth.Label>
								<Auth.Input type="email" autocomplete="email" class={inputClass} />
								<Auth.Error />
							</Auth.Field>
							<Auth.Field name="password">
								<Auth.Label class={labelClass}>Password</Auth.Label>
								<Auth.Input type="password" autocomplete="current-password" class={inputClass} />
								<Auth.Error />
							</Auth.Field>
							<Auth.Error />
							<div class="flex justify-end text-sm">
								<button
									type="button"
									onclick={() => {
										forgotSent = false;
										mode = 'forgot';
									}}
									class="underline hover:opacity-70 transition-opacity"
								>
									Forgot password?
								</button>
							</div>
							<Auth.Submit class={submitClass}>Sign In</Auth.Submit>
						</Auth.LoginForm>

						<div class="mt-8 pt-8 border-t border-gray-200 text-center">
							<p class="text-sm text-gray-600 mb-4">New here?</p>
							<button onclick={() => (mode = 'register')} class="text-sm underline hover:opacity-70 transition-opacity">
								Create an Account
							</button>
						</div>
					{:else if mode === 'register'}
						<h1 class="text-4xl font-serif mb-2">Join the Muse List</h1>
						<p class="text-sm text-gray-600 mb-12">Create your account</p>

						<Auth.RegisterForm class="space-y-6">
							<Auth.Field name="email">
								<Auth.Label class={labelClass}>Email Address</Auth.Label>
								<Auth.Input type="email" autocomplete="email" class={inputClass} />
								<Auth.Error />
							</Auth.Field>
							<Auth.Field name="password">
								<Auth.Label class={labelClass}>Password</Auth.Label>
								<Auth.Input type="password" autocomplete="new-password" class={inputClass} />
								<Auth.Error />
							</Auth.Field>
							<Auth.Error />
							<Auth.Submit class={submitClass}>Create Account</Auth.Submit>
						</Auth.RegisterForm>

						<div class="mt-8 pt-8 border-t border-gray-200 text-center">
							<p class="text-sm text-gray-600 mb-4">Already have an account?</p>
							<button onclick={() => (mode = 'login')} class="text-sm underline hover:opacity-70 transition-opacity">
								Sign In
							</button>
						</div>
					{:else}
						<h1 class="text-4xl font-serif mb-2">Reset Password</h1>
						<p class="text-sm text-gray-600 mb-12">We'll email you a link to choose a new one</p>

						{#if forgotSent}
							<p class="text-sm text-gray-700 leading-relaxed">
								If an account exists for that email, we've sent a link to reset your password.
							</p>
						{:else}
							<Auth.ForgotForm class="space-y-6" onsuccess={() => (forgotSent = true)}>
								<Auth.Field name="email">
									<Auth.Label class={labelClass}>Email Address</Auth.Label>
									<Auth.Input type="email" autocomplete="email" class={inputClass} />
									<Auth.Error />
								</Auth.Field>
								<Auth.Error />
								<Auth.Submit class={submitClass}>Send Reset Link</Auth.Submit>
							</Auth.ForgotForm>
						{/if}

						<div class="mt-8 pt-8 border-t border-gray-200 text-center">
							<button onclick={() => (mode = 'login')} class="text-sm underline hover:opacity-70 transition-opacity">
								Back to Sign In
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="bg-white min-h-screen">
		<div class="border-b border-gray-200 py-16">
			<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24">
				<h1 class="text-5xl md:text-6xl font-serif mb-4">Welcome back, {displayName}</h1>
				<p class="text-lg text-gray-600">Your personal sanctuary</p>
			</div>
		</div>

		<div class="h-32"></div>

		<div class="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-32">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
				<a href="/shop" class="border-2 border-gray-200 p-8 hover:border-gray-900 transition-colors group">
					<h3 class="text-lg font-serif mb-2 group-hover:opacity-70 transition-opacity">Continue Shopping</h3>
					<p class="text-sm text-gray-600">Explore new arrivals</p>
				</a>

				<a href="#orders" class="border-2 border-gray-200 p-8 hover:border-gray-900 transition-colors group text-left">
					<h3 class="text-lg font-serif mb-2 group-hover:opacity-70 transition-opacity">Your Orders</h3>
					<p class="text-sm text-gray-600">View your order history</p>
				</a>

				<a href="/customer-care" class="border-2 border-gray-200 p-8 hover:border-gray-900 transition-colors group text-left">
					<h3 class="text-lg font-serif mb-2 group-hover:opacity-70 transition-opacity">Customer Care</h3>
					<p class="text-sm text-gray-600">Sizing, shipping and returns</p>
				</a>
			</div>

			<div id="orders" class="mb-24 scroll-mt-32">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-serif">Orders</h2>
				</div>

				{#if ordersResult.error}
					<p class="text-sm text-gray-600">{dev ? ordersResult.error : 'Your orders could not be loaded right now.'}</p>
				{:else if orders.length === 0}
					<div class="border-2 border-gray-200 p-12 text-center">
						<p class="text-gray-600 mb-6">You haven't placed an order yet.</p>
						<a
							href="/shop"
							class="inline-block border-2 border-gray-900 px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-900 hover:text-white transition-all"
						>
							Explore Collection
						</a>
					</div>
				{:else}
					<div class="space-y-6">
						{#each orders as order (order.id)}
							<div class="border-2 border-gray-200 p-6">
								<div class="flex items-start justify-between mb-6">
									<div>
										<h3 class="text-lg mb-1">Order #{order.display_id ?? order.id}</h3>
										<p class="text-sm text-gray-600">{fmtDate(order.created_at)}</p>
									</div>
									<div class="text-right">
										<p class="text-lg mb-1">
											{formatPrice(order.total, (order.currency_code ?? 'eur').toUpperCase())}
										</p>
										<span class="text-xs tracking-wider uppercase text-green-700">{statusLabel(order.status)}</span>
									</div>
								</div>

								{#if order.items?.length}
									<div class="flex space-x-4 overflow-x-auto pb-2">
										{#each order.items as item (item.id)}
											<a href={item.product_handle ? `/product/${item.product_handle}` : '/shop'} class="flex-shrink-0 w-24 group">
												<div class="relative w-24 h-32 bg-gray-100 border border-gray-200 mb-2 overflow-hidden">
													<ProductMedia src={item.thumbnail} alt={item.product_title ?? item.title} label="[Img]" />
												</div>
												<p class="text-xs text-gray-600 line-clamp-2 group-hover:opacity-70 transition-opacity">
													{item.product_title ?? item.title}
												</p>
											</a>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="border-t border-gray-200 pt-16">
				<h2 class="text-3xl font-serif mb-8">Account Settings</h2>

				<div class="space-y-4">
					<div class="border-2 border-gray-200 p-6">
						{#if !editing}
							<div class="flex items-center justify-between">
								<div class="text-left">
									<h3 class="text-sm font-medium mb-1">Personal Information</h3>
									<p class="text-sm text-gray-600">{customer.email}</p>
									{#if customer.first_name || customer.last_name || customer.phone}
										<p class="text-sm text-gray-600">
											{[displayName, customer.phone].filter(Boolean).join(' · ')}
										</p>
									{/if}
								</div>
								<button onclick={startEditing} class="text-sm underline hover:opacity-70 transition-opacity">Edit</button>
							</div>
						{:else}
							<form onsubmit={saveProfile} class="space-y-4">
								<h3 class="text-sm font-medium">Personal Information</h3>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label for="acct-first" class={labelClass}>First Name</label>
										<input id="acct-first" class={inputClass} bind:value={firstName} autocomplete="given-name" />
									</div>
									<div>
										<label for="acct-last" class={labelClass}>Last Name</label>
										<input id="acct-last" class={inputClass} bind:value={lastName} autocomplete="family-name" />
									</div>
								</div>
								<div>
									<label for="acct-phone" class={labelClass}>Phone</label>
									<input id="acct-phone" type="tel" class={inputClass} bind:value={phone} autocomplete="tel" />
								</div>
								{#if profileMessage}
									<p role="alert" class="text-sm text-red-700">{profileMessage}</p>
								{/if}
								<div class="flex gap-4">
									<button
										type="submit"
										disabled={saving}
										class="bg-gray-900 text-white px-8 py-3 text-sm tracking-[0.2em] uppercase hover:bg-gray-800 transition-all disabled:opacity-50"
									>
										{saving ? 'Saving…' : 'Save'}
									</button>
									<button type="button" onclick={() => (editing = false)} class="text-sm underline hover:opacity-70 transition-opacity">
										Cancel
									</button>
								</div>
							</form>
						{/if}
					</div>

					<div class="border-2 border-gray-200 p-6">
						<h3 class="text-sm font-medium mb-1">Shipping Addresses</h3>
						{#if addresses.length === 0}
							<p class="text-sm text-gray-600">No saved addresses yet.</p>
						{:else}
							<ul class="mt-4 divide-y divide-gray-200">
								{#each addresses as address (address.id)}
									<li class="flex items-start justify-between gap-6 py-4 text-sm text-gray-700">
										<div class="leading-relaxed">
											<p>{[address.first_name, address.last_name].filter(Boolean).join(' ')}</p>
											<p>{[address.address_1, address.address_2].filter(Boolean).join(', ')}</p>
											<p>
												{[address.postal_code, address.city, address.province].filter(Boolean).join(' ')}
												{address.country_code?.toUpperCase()}
											</p>
										</div>
										<button
											onclick={() => removeAddress(address.id)}
											class="text-xs underline text-gray-500 hover:text-gray-900 transition-colors"
										>
											Remove
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				<button
					onclick={signOut}
					disabled={signingOut}
					class="mt-8 text-sm underline text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
				>
					Sign Out
				</button>
			</div>
		</div>
	</div>
{/if}
