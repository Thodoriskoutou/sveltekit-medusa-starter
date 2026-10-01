import type { ContentItem } from 'medusa-js-sdk';

/**
 * Turns posts from the Medusa content plugin (`medusa-plugin-content`) into what the Journal pages
 * render. The plugin stores each post's custom fields in `metadata`, so the collection is expected
 * to define these optional fields (the seed tool in scripts/seed/journal.ts creates them):
 *
 *   excerpt      short summary for cards      (falls back to the first paragraph of the post)
 *   cover_image  image URL for cards / hero    (falls back to the first image inside the post)
 *   category     label shown above the title   (falls back to the first tag, then "Journal")
 *   featured     true → shown as the big hero  (falls back to the newest post)
 *   products     product handles, comma-separated, for the "Shop the Story" strip
 *                                              (falls back to the newest products)
 */

export interface Post {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	cover: string | null;
	/** Formatted publish date, e.g. "5 March 2026". */
	date: string;
	/** Publish time as a number, for sorting newest-first. */
	time: number;
	tags: string[];
	author: { name: string; bio: string | null; avatar: string | null } | null;
	readMinutes: number;
	featured: boolean;
	/** Product handles chosen for this post (may be empty). */
	productHandles: string[];
	/** Markdown source. */
	body: string;
	/** Sanitized HTML, only present when the post was fetched with `render: 'html'`. */
	bodyHtml: string | null;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const truthy = (v: unknown): boolean => v === true || (typeof v === 'string' && /^(true|yes|1)$/i.test(v.trim()));

/** Markdown → plain text (good enough for an excerpt). */
function plainText(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^>\s?/gm, '')
		.replace(/[*_`~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function firstParagraph(markdown: string): string {
	const blocks = markdown.split(/\n\s*\n/).map(plainText).filter(Boolean);
	// skip a leading heading-only block: it was stripped to text, so prefer the first longer block
	const paragraph = blocks.find((b) => b.length > 60) ?? blocks[0] ?? '';
	return paragraph.length > 180 ? `${paragraph.slice(0, 177).trimEnd()}…` : paragraph;
}

function firstImage(markdown: string): string | null {
	return /!\[[^\]]*\]\(([^)\s]+)/.exec(markdown)?.[1] ?? null;
}

function formatDate(iso: string | undefined): string {
	if (!iso) return '';
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function toPost(item: ContentItem): Post {
	const meta = (item.metadata ?? {}) as Record<string, unknown>;
	const body = item.body ?? '';
	const tags = (item.tags ?? []).map((t) => t.value);

	return {
		id: item.id,
		slug: item.slug,
		title: item.title,
		excerpt: str(meta.excerpt) || firstParagraph(body),
		category: str(meta.category) || tags[0] || 'Journal',
		cover: str(meta.cover_image) || str(meta.cover) || firstImage(body),
		date: formatDate(item.published_at ?? item.created_at),
		time: Date.parse(item.published_at ?? item.created_at) || 0,
		tags,
		author: item.creator
			? { name: item.creator.name, bio: item.creator.bio ?? null, avatar: item.creator.avatar_url ?? null }
			: null,
		readMinutes: Math.max(1, Math.round(plainText(body).split(' ').filter(Boolean).length / 220)),
		featured: truthy(meta.featured),
		productHandles: str(meta.products)
			.split(/[\s,]+/)
			.filter(Boolean)
			.slice(0, 3),
		body,
		bodyHtml: item.body_html ?? null
	};
}

/** The post to feature in the hero: one marked `featured`, otherwise the newest. */
export function pickFeatured(posts: Post[]): Post | undefined {
	return posts.find((p) => p.featured) ?? posts[0];
}
