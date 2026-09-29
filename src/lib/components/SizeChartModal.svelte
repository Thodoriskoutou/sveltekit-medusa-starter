<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		productType?: 'bikini-top' | 'bikini-bottom' | 'one-piece' | 'cover-up';
	}

	let { isOpen, onClose }: Props = $props();

	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	const bikiniTopSizes = [
		{ size: 'XS', bust: '32-33"', underbust: '27-28"', cup: 'A-B', intSize: 'EU 32-34' },
		{ size: 'S', bust: '34-35"', underbust: '28-29"', cup: 'B-C', intSize: 'EU 36-38' },
		{ size: 'M', bust: '36-37"', underbust: '30-31"', cup: 'C-D', intSize: 'EU 40-42' },
		{ size: 'L', bust: '38-39"', underbust: '32-33"', cup: 'D-DD', intSize: 'EU 44-46' },
		{ size: 'XL', bust: '40-42"', underbust: '34-35"', cup: 'DD-E', intSize: 'EU 48-50' }
	];

	const bikiniBottomSizes = [
		{ size: 'XS', waist: '24-25"', hip: '34-35"', intSize: 'EU 32-34' },
		{ size: 'S', waist: '26-27"', hip: '36-37"', intSize: 'EU 36-38' },
		{ size: 'M', waist: '28-29"', hip: '38-39"', intSize: 'EU 40-42' },
		{ size: 'L', waist: '30-32"', hip: '40-42"', intSize: 'EU 44-46' },
		{ size: 'XL', waist: '33-35"', hip: '43-45"', intSize: 'EU 48-50' }
	];
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center backdrop-atelier"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div class="relative w-full max-w-3xl max-h-[85vh] bg-surface-white overflow-y-auto mx-4 shadow-luxury-lg">
			<button
				onclick={onClose}
				class="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center text-gray-900 hover:text-gray-600 transition-colors"
				aria-label="Close size chart"
			>
				<X class="w-5 h-5" strokeWidth={1} />
			</button>

			<div class="p-8 md:p-12">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-serif mb-4">Size Guide</h2>
					<p class="text-base leading-relaxed text-gray-600 max-w-2xl">
						Our pieces are designed to fit true to size with Italian sizing standards. For the
						perfect fit, we recommend measuring yourself and comparing with the chart below.
					</p>
				</div>

				<div class="mb-12 p-6 bg-gray-50 border border-gray-200">
					<h3 class="text-xs tracking-widest uppercase text-gray-500 mb-4">How to Measure</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
						<div>
							<p class="font-medium mb-2">Bust</p>
							<p class="text-gray-600">
								Measure around the fullest part of your bust, keeping the tape parallel to the
								floor
							</p>
						</div>
						<div>
							<p class="font-medium mb-2">Waist</p>
							<p class="text-gray-600">
								Measure around your natural waistline, keeping the tape comfortably loose
							</p>
						</div>
						<div>
							<p class="font-medium mb-2">Hip</p>
							<p class="text-gray-600">
								Measure around the fullest part of your hips, approximately 8" below your waist
							</p>
						</div>
					</div>
				</div>

				<div class="mb-12">
					<h3 class="text-lg font-serif mb-6">Bikini Top Sizes</h3>
					<div class="overflow-x-auto">
						<table class="w-full text-sm border-collapse">
							<thead>
								<tr class="border-b-2 border-gray-900">
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Size</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Bust</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Underbust</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Cup Size</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Int'l Size</th>
								</tr>
							</thead>
							<tbody>
								{#each bikiniTopSizes as row, index (row.size)}
									<tr class="border-b border-gray-200 {index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
										<td class="py-4 px-4 font-medium">{row.size}</td>
										<td class="py-4 px-4 text-gray-600">{row.bust}</td>
										<td class="py-4 px-4 text-gray-600">{row.underbust}</td>
										<td class="py-4 px-4 text-gray-600">{row.cup}</td>
										<td class="py-4 px-4 text-gray-600">{row.intSize}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<div class="mb-12">
					<h3 class="text-lg font-serif mb-6">Bikini Bottom Sizes</h3>
					<div class="overflow-x-auto">
						<table class="w-full text-sm border-collapse">
							<thead>
								<tr class="border-b-2 border-gray-900">
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Size</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Waist</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Hip</th>
									<th class="text-left py-4 px-4 text-xs tracking-widest uppercase text-gray-500 font-medium">Int'l Size</th>
								</tr>
							</thead>
							<tbody>
								{#each bikiniBottomSizes as row, index (row.size)}
									<tr class="border-b border-gray-200 {index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
										<td class="py-4 px-4 font-medium">{row.size}</td>
										<td class="py-4 px-4 text-gray-600">{row.waist}</td>
										<td class="py-4 px-4 text-gray-600">{row.hip}</td>
										<td class="py-4 px-4 text-gray-600">{row.intSize}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<div class="border-t border-gray-200 pt-8">
					<h3 class="text-xs tracking-widest uppercase text-gray-500 mb-4">Fit Notes</h3>
					<div class="space-y-3 text-sm text-gray-600">
						<p>• All measurements are approximate and may vary slightly by style</p>
						<p>
							• Between sizes? We recommend sizing up for more coverage, down for a sportier fit
						</p>
						<p>• Our adjustable ties and clasps allow for customizable fit</p>
						<p>• Each piece is handcrafted in Italy with premium Italian lycra</p>
					</div>
				</div>

				<div class="mt-8 flex justify-end">
					<button onclick={onClose} class="btn-primary-cta px-8 py-3 text-sm tracking-[0.2em] uppercase">
						Got It
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
