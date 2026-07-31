<script lang="ts">
	// Stripe checkout (Elements mode).
	//
	// `CheckoutStripe` owns the whole flow: address form → shipping options →
	// payment session → confirm → complete cart → redirect. The address form it uses
	// is the SDK's provider-agnostic `checkoutForm`.
	//
	// `returnUrl` MUST point at this app's /checkout/return route — Stripe requires it
	// even when confirmation happens without a redirect.
	import { STRIPE_KEY, STRIPE_REDIRECT_URL } from '$app/env/public'
	import { CheckoutStripe } from '$lib/components/ui/checkout'
	import { Metadata } from '$lib/components/ui/seo'
</script>

<Metadata config={{ title: 'Checkout', noindex: true }} />

<section class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-semibold tracking-tight">Checkout</h1>

	{#if !STRIPE_KEY}
		<p class="mt-6 rounded-md border border-dashed p-6 text-muted-foreground">
			Set <code>STRIPE_KEY</code> and <code>STRIPE_REDIRECT_URL</code> in your <code>.env</code> to enable checkout. Your Medusa region also needs the
			Stripe payment provider enabled.
		</p>
	{:else}
		<div class="mt-8">
			<CheckoutStripe publishableKey={STRIPE_KEY} returnUrl={STRIPE_REDIRECT_URL} />
		</div>
	{/if}
</section>
