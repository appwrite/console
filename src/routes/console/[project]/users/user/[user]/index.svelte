<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Card, Copy } from '$lib/components';
	import { Button } from '$lib/elements/forms';
	import { Container } from '$lib/layout';
	import { sdkForProject } from '$lib/stores/sdk';
	import { user } from './store';

	const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 128, 128).toString();
	const deleteUser = async (id: string) => {
		try {
			if (!confirm('Are you sure you want to delete that user?')) return;
			await sdkForProject.users.delete(id);
			await goto(`/console/${$page.params.project}/users`);
		} catch (error) {
			console.error(error);
		}
	};
</script>

<Container>
	<h1>Overview</h1>
	<Card>
		<Copy value={$user.$id} />
		<p><img src={getAvatar($user.name)} alt={$user.name} class="avatar" /></p>
		<p>{$user.$id}</p>
		<p>Member since {$user.registration}</p>
		<p>{$user.emailVerification ? 'Verified' : 'Unverified'}</p>
		<p>{$user.email}</p>
	</Card>

	<h1>Preferences</h1>
	<Card>
		{#each Object.entries($user.prefs) as [key, value]}
			<p>{key}: {value}</p>
		{:else}
			No user preferences found.
		{/each}
	</Card>

	<h1>Danger Zone</h1>
	<Card>
		<p>This is the area where you can delete this user.</p>
		<p>By deleting this user you will lose all data associated with this user.</p>
		<p>PLEASE NOTE: User deletion is irreversible.</p>
		<Button on:click={() => deleteUser($user.$id)}>Delete User</Button>
	</Card>
</Container>
