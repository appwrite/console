<script lang="ts">
	import { page } from '$app/stores';
	import { Card, Pagination } from '$lib/components';
	import { Button } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';

	let offset = 0;

	const limit = 25;
	const deleteSession = async (id: string) => {
		try {
			await sdkForProject.users.deleteSession($page.params.user, id);
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
	const deleteAllSessions = async () => {
		try {
			if (confirm('You really want to delete all sessions?')) {
				await sdkForProject.users.deleteSessions($page.params.user);
			}
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};

	$: request = sdkForProject.users.getSessions($page.params.user);
</script>

<h1>Sessions</h1>
{#await request}
	<div aria-busy="true" />
{:then response}
	<Card>
		<ul class="sessions">
			{#each response.sessions as session}
				<li class="sessions-item">
					<article class="card">
						<img
							class="sessions-item-image"
							src={sdkForProject.avatars.getBrowser(session.clientCode, 64, 64).toString()}
							alt={session.clientName}
						/>
						<header class="sessions-item-header">
							<h2 class="sessions-item-title">
								<span class="text">
									<span class="browser-name">{session.clientName}</span>
									<span class="browser-version">{session.clientVersion}</span>
									<span>on</span>
									<span class="browser-os">{session.osName}</span>
									<span class="browser-os-version">{session.osVersion}</span>
								</span>
							</h2>
							{#if session.current}
								<span class="pill is-success">Current Session</span>
							{/if}
						</header>
						<p class="sessions-item-info">{session.ip} / {session.countryName}</p>
						<Button danger on:click={() => deleteSession(session.$id)}>Logout</Button>
					</article>
				</li>
			{:else}
				<p>No sessions available.</p>
			{/each}
		</ul>
		<Pagination {limit} bind:offset sum={response.total} />
	</Card>
	{#if response.total}
		<Button danger on:click={deleteAllSessions}>Logout from all sessions</Button>
	{/if}
{/await}
