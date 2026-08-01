<script lang="ts">
	import * as Customer from '$lib/components/ui/customer'
	import UserIcon from '@lucide/svelte/icons/circle-user-round'
</script>

<Customer.SignedOut>
	<Customer.SignIn>
		<UserIcon class="size-8" />
		<span class="sr-only">Sign in</span>
	</Customer.SignIn>
</Customer.SignedOut>
<Customer.SignedIn>
	<Customer.Menu>
		<Customer.MenuTrigger>
			<UserIcon class="size-8" />
			<span class="sr-only">Account menu</span>
		</Customer.MenuTrigger>
		<Customer.MenuContent>
			<Customer.MenuItem href="/account">Account</Customer.MenuItem>
			<Customer.SignOut>Sign out</Customer.SignOut>
		</Customer.MenuContent>
	</Customer.Menu>
</Customer.SignedIn>
