/** What a visitor can say their message is about (the key travels in the URL as ?topic=… and in the form). */
export const TOPICS = {
	sizing: 'Sizing & fit',
	order: 'My order',
	shipping: 'Shipping & returns',
	other: 'Something else'
} as const;

export type Topic = keyof typeof TOPICS;

export const isTopic = (value: unknown): value is Topic => typeof value === 'string' && value in TOPICS;
