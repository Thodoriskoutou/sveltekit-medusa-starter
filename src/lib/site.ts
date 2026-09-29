/**
 * Store-owner settings that aren't in Medusa. Fill these in and the matching parts of the site
 * appear; anything left empty stays hidden, so the site never shows a dead link or a made-up claim.
 */
export const site = {
	name: 'Wild Coral',

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
	notFound: '/photos/4b3228c7-59d0-49b4-a919-0091bff3b4f3.jpeg'
};
