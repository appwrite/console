<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { Button } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';

	let id: HTMLInputElement;
	const request = sdkForProject.users.get($page.params.user);
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

{#await request}
	<div aria-busy="true" />
{:then user}
	<h1>Overview</h1>
	<article class="overview">
		<p><img src={getAvatar(user.name)} alt={user.name} class="avatar" /></p>
		<p class="id" data-tooltip="Click to copy.">{user.$id}</p>
		<p>Member since {user.registration}</p>
		<p>{user.emailVerification ? 'Verified' : 'Unverified'}</p>
		<p>{user.email}</p>
	</article>

	<h1>Preferences</h1>
	<article>
		{#each Object.entries(user.prefs) as [key, value]}
			<p>{key}: {value}</p>
		{:else}
			No user preferences found.
		{/each}
	</article>

	<h1>Danger Zone</h1>
	<article class="danger">
		<p>This is the area where you can delete this user.</p>
		<p>By deleting this user you will lose all data associated with this user.</p>
		<p>PLEASE NOTE: User deletion is irreversible.</p>
		<Button on:click={() => deleteUser(user.$id)}>Delete User</Button>
	</article>
{/await}

<style lang="scss">
	article.overview {
		display: flex;
		flex-direction: column;
		align-items: center;

		.id {
			cursor: pointer;
		}

		.avatar {
			border-radius: 50%;
		}
	}

	article.danger {
		background-color: #f53d3d;
		p {
			color: #ffffff;
		}
	}
</style>
