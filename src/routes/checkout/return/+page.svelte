<script lang="ts">
	// Stripe redirects here after payment. `Return` reads the redirect result, completes
	// the cart, and then navigates on. It is standalone — not inside Checkout.Root.
	//
	// Point STRIPE_REDIRECT_URL at this route's absolute URL.
	import { STRIPE_KEY } from '$app/env/public'
	import { Return } from '$lib/components/ui/checkout'
	import { Metadata } from '$lib/components/ui/seo'
</script>

<Metadata config={{ title: 'Order confirmation', noindex: true }} />

<section class="mx-auto max-w-3xl px-4 py-12">
	<Return publishableKey={STRIPE_KEY} />
</section>
