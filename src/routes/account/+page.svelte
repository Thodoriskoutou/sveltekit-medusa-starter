<script lang="ts">
	// Account page.
	//
	// `Customer.SignedIn` / `SignedOut` resolve the session themselves, so no server
	// load guard is needed — signed-out visitors get the sign-in prompt instead of a
	// redirect. Add a +page.server.ts guard if you'd rather bounce them.
	import { getCustomer, getOrders } from 'sveltekit-medusa-sdk'
	import * as Customer from '$lib/components/ui/customer'
	import { Metadata } from '$lib/components/ui/seo'
</script>

<Metadata config={{ title: 'Account', noindex: true }} />

<section class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-semibold tracking-tight">Account</h1>

	<Customer.SignedOut>
		<p class="mt-6 text-muted-foreground">You are not signed in.</p>
		<div class="mt-4">
			<Customer.SignIn />
		</div>
	</Customer.SignedOut>

	<Customer.SignedIn>
		<svelte:boundary>
			{#snippet pending()}
				<p class="mt-6 text-muted-foreground">Loading…</p>
			{/snippet}

			{#snippet failed(error)}
				<p class="mt-6 text-muted-foreground">{error instanceof Error ? error.message : 'Could not load your account.'}</p>
			{/snippet}

			{@const customer = await getCustomer()}
			{@const orders = await getOrders()}

			<dl class="mt-6 grid gap-2 text-sm">
				<div class="flex gap-2">
					<dt class="w-24 text-muted-foreground">Name</dt>
					<dd>{[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || '—'}</dd>
				</div>
				<div class="flex gap-2">
					<dt class="w-24 text-muted-foreground">Email</dt>
					<dd>{customer?.email}</dd>
				</div>
			</dl>

			<h2 class="mt-10 text-xl font-semibold tracking-tight">Orders</h2>
			{#if !orders?.length}
				<p class="mt-2 text-muted-foreground">No orders yet.</p>
			{:else}
				<ul class="mt-4 divide-y rounded-md border">
					{#each orders as order (order.id)}
						<li class="flex items-center justify-between gap-4 p-4 text-sm">
							<span class="font-medium">#{order.display_id}</span>
							<span class="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
							<span>{order.status}</span>
						</li>
					{/each}
				</ul>
			{/if}

			<div class="mt-10">
				<Customer.SignOut>Sign out</Customer.SignOut>
			</div>
		</svelte:boundary>
	</Customer.SignedIn>
</section>
