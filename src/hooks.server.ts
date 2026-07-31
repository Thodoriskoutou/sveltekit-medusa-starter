import { createMedusaHandle } from 'sveltekit-medusa-sdk/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, MEDUSA_DEFAULT_REGION_ID, MEDUSA_DEFAULT_COUNTRY_CODE } from '$app/env/private'

/**
 * Configures the Medusa client once, per request. Everything else — cart, session,
 * region and country resolution — is handled by the SDK's remote functions, which
 * resolve the same context on their own.
 *
 * See the SDK docs for the full option list (cookie names, `transferCartOnLogin`,
 * affiliate tracking, analytics headers).
 */
export const handle = createMedusaHandle({
	baseUrl: MEDUSA_BACKEND_URL,
	publishableKey: MEDUSA_PUBLISHABLE_KEY,
	defaultRegionId: MEDUSA_DEFAULT_REGION_ID || undefined,
	defaultCountryCode: MEDUSA_DEFAULT_COUNTRY_CODE || undefined
})
