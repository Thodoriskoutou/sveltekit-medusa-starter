/**
 * Store-owner settings that aren't in Medusa. Fill these in and the matching parts of the site
 * appear; anything left empty stays hidden, so the site never shows a dead link or a made-up claim.
 */
export const site = {
	name: 'Wild Coral',

	/** Slug of the Medusa content-plugin collection that holds the Journal posts. */
	journalCollection: 'journal',

	/**
	 * Social profiles shown as icons in the footer ("Follow Us"). For each network:
	 *   - a full URL      → a working link (e.g. 'https://www.instagram.com/yourhandle')
	 *   - '' (empty)      → the icon shows dimmed and not clickable, until you add the URL
	 *   - key removed     → that network isn't shown at all
	 * Also supported: tiktok, youtube (add the key to show them).
	 */
	social: {
		instagram: '',
		facebook: '',
		pinterest: ''
	} as Partial<Record<'instagram' | 'facebook' | 'pinterest' | 'tiktok' | 'youtube', string>>,
	/** Shown under the footer icons, e.g. '@yourhandle'. */
	instagramHandle: '',
	/** Shown on the order-confirmation page, e.g. '#WildCoral'. */
	hashtag: '#WildCoral',

	/**
	 * Short intro under the heading on /shop. A category's own description in Medusa
	 * (Products → Categories → the category → Description) replaces it on that category's page.
	 */
	shopIntro: 'Swimwear for long summer days. Explore the collection below.',

	/**
	 * One line about delivery for the "Delivery" block on /shop, e.g. 'Delivery across Greece from €4.50.'
	 * Keep it in step with the shipping options in Medusa (Settings → Locations & Shipping).
	 */
	deliveryNote: 'Delivery options and prices are shown at checkout.',

	/**
	 * Your size chart, one row per size, shown in the size guide and on product pages. Measurements are
	 * body measurements in the unit below. Left empty, the size guide shows no table (and asks customers
	 * to write to you) rather than showing numbers you haven't confirmed.
	 *   e.g. { size: 'S', bust: '84–88', waist: '64–68', hips: '90–94' }
	 */
	sizeChart: [] as { size: string; bust: string; waist: string; hips: string }[],
	sizeChartUnit: 'cm',

	/** Public contact email. When set, "Contact Us" and the cart's help link open an email. */
	contactEmail: '',

	/** Support hours shown on the customer-care page, e.g. 'Monday–Friday, 10:00–18:00 (Athens time)'. Empty hides the line. */
	supportHours: '',

	/** Links used by the cookie banner. Add the URL of each page once it exists (e.g. '/privacy'). */
	legal: {
		privacy: '',
		cookies: '',
		terms: ''
	},

	/**
	 * "As featured in" strip on the home page. Add real outlets only (e.g. ['Vogue Greece']);
	 * while empty the whole section is hidden.
	 */
	press: [] as string[],

	/**
	 * Where the home page "Join the Muse List" form posts to (the form action URL from your email
	 * provider). While empty the whole section is hidden, because a subscribe button that goes
	 * nowhere would just lose people's emails.
	 */
	newsletterAction: '',

	/**
	 * "Shop the Look" markers on the home page photo. `x` / `y` are percentages across / down the
	 * photo; `handle` is the Medusa product handle the marker opens. A marker whose product doesn't
	 * exist (yet) is simply not shown.
	 */
	shopTheLook: [
		{ x: 54, y: 56, handle: 'sequin-ring-bikini' },
		{ x: 42, y: 72, handle: 'sequin-ring-bikini' }
	]
};

/**
 * Photos used for the site's styling (files live in `static/photos`). Change a path here to swap
 * the picture everywhere it is used.
 */
export const photos = {
	hero: '/photos/IMG_0421.jpeg',
	shopTheLook: '/photos/IMG_0424.jpeg',
	onePiece: '/photos/9A44AF1F-4F83-4919-A384-2431D13ACBE4.jpeg',
	bikini: '/photos/IMG_1645.jpeg',
	orderConfirmed: '/photos/IMG_1643.jpeg',
	account: '/photos/IMG_1637.jpeg',
	editorial: '/photos/IMG_1595.jpeg',
	detail: '/photos/IMG_9607.jpeg',
	notFound: '/photos/4b3228c7-59d0-49b4-a919-0091bff3b4f3.jpeg'
};
