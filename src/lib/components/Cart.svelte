<script lang="ts">
	import * as Cart from '$lib/components/ui/cart/index.js'
	import type { LineHrefFn } from '$lib/components/ui/cart'
	import type { StoreCart } from '@medusajs/types'

	interface Props {
		onupdate?: (cart: StoreCart) => void
		onremove?: (cart: StoreCart) => void
		onerror?: (err: unknown) => void
		checkoutUrl?: string
		lineHref?: LineHrefFn
	}
	let { onupdate, onremove, onerror, checkoutUrl = '/checkout', lineHref }: Props = $props()
</script>

<Cart.Root class="flex items-center" {onupdate} {onremove} {onerror} {checkoutUrl} {lineHref}>
	<Cart.Sheet>
		<Cart.Trigger class="" />
		<Cart.Content class="">
			<Cart.Header />
			<Cart.Items class="border-t">
				<div class="flex flex-1 gap-4">
					<Cart.Image />
					<div class="flex min-w-0 flex-1 flex-col">
						<div class="flex justify-between gap-2">
							<Cart.Title />
							<Cart.Price />
						</div>
						<div class="mt-4 flex items-end justify-between">
							<Cart.Quantity />
							<Cart.Remove />
						</div>
					</div>
				</div>
			</Cart.Items>
			<div class="bg-popover sticky bottom-0 mt-auto border-t py-4">
				<Cart.Subtotal class="px-2" />
				<p class="text-muted-foreground mt-1 px-2 text-sm">Shipping and taxes calculated at checkout.</p>
				<div class="mt-4 px-2">
					<Cart.Checkout />
				</div>
			</div>
		</Cart.Content>
	</Cart.Sheet>
</Cart.Root>
