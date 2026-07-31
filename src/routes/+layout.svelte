<script lang="ts">
	import './layout.css'
	import { ModeWatcher } from 'mode-watcher'
	import { SITE_NAME, SITE_URL } from '$app/env/public'
	import { MetaProvider } from '$lib/components/ui/seo'
	import * as Auth from '$lib/components/ui/auth'
	import Navbar from '$lib/components/Navbar.svelte'
	import Footer from '$lib/components/Footer.svelte'

	let { children } = $props()
</script>

<!-- Keeps the `.dark` class on <html> in sync with the visitor's preference. -->
<ModeWatcher />

<!-- Site-wide SEO defaults; each page overrides them with <Metadata config={...} />. -->
<MetaProvider site={{ siteName: SITE_NAME, siteUrl: SITE_URL, titleTemplate: `%s | ${SITE_NAME}` }}>
	<div class="flex min-h-screen flex-col">
		<Navbar />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer />
	</div>

	<!-- Opens on ?auth=login|register|forgot|reset. Mount once, here. -->
	<Auth.Dialog />
</MetaProvider>
