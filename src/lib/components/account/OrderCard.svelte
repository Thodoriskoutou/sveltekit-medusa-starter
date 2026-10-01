<script lang="ts">
	// One order in the account's order list: number, date, total, status and item thumbnails.
	// The whole card opens the order's tracking page.
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { formatPrice } from '$lib/medusa/catalog';
	import type { OrderView } from '$lib/medusa/order-tracking';
	import ProductMedia from '$lib/components/ProductMedia.svelte';
	import OrderStatusBadge from './OrderStatusBadge.svelte';

	let { order, href }: { order: OrderView; href?: string } = $props();

	const fmtDate = (d: string) => new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
	const shown = $derived(order.items.slice(0, 5));
	const more = $derived(Math.max(0, order.items.length - shown.length));
</script>

<a
	href={href ?? `/account/orders/${order.id}`}
	class="group block border-2 border-gray-200 p-6 transition-colors hover:border-gray-900"
	aria-label="Order {order.number}, {order.statusLabel}. Track order"
>
	<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
		<div>
			<h3 class="mb-1 text-lg">Order {order.number}</h3>
			<p class="text-sm text-gray-600">
				{[fmtDate(order.createdAt), order.itemCount ? `${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'}` : null]
					.filter(Boolean)
					.join(' · ')}
			</p>
		</div>
		<div class="text-right">
			<p class="mb-2 text-lg">{formatPrice(order.totals.total, order.currency)}</p>
			<OrderStatusBadge {order} />
		</div>
	</div>

	{#if shown.length}
		<div class="mb-6 flex gap-4 overflow-x-auto pb-2">
			{#each shown as item (item.id)}
				<div class="w-24 shrink-0">
					<div class="relative mb-2 h-32 w-24 overflow-hidden border border-gray-200 bg-gray-100">
						<ProductMedia src={item.thumbnail} alt={item.title} />
					</div>
					<p class="line-clamp-2 text-xs text-gray-600">{item.title}</p>
				</div>
			{/each}
			{#if more}
				<div class="flex h-32 w-24 shrink-0 items-center justify-center border border-dashed border-gray-300 text-xs text-gray-500">
					+{more} more
				</div>
			{/if}
		</div>
	{/if}

	<span class="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase group-hover:opacity-70 transition-opacity">
		Track order <ArrowRight class="size-4" />
	</span>
</a>
