<script lang="ts">
	import { page } from '$app/stores';
	import { Card, Pagination } from '$lib/components';
	import { Button } from '$lib/elements/forms';
	import { Table, TableCell, TableHeader, TableBody, TableRow } from '$lib/elements/table';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';

	const getSessions = () => sdkForProject.users.getSessions($page.params.user);
	const deleteSession = async (id: string) => {
		try {
			await sdkForProject.users.deleteSession($page.params.user, id);
			request = getSessions();
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
	let offset = 0;
	const limit = 25;

	let request = getSessions();
</script>

<h1>Sessions</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell>Browser</TableCell>
				<TableCell>Country</TableCell>
				<TableCell>OS</TableCell>
				<TableCell>IP</TableCell>
				<TableCell />
			</TableHeader>
			<TableBody>
				{#each response.sessions as session}
					<TableRow>
						<TableCell
							><img
								src={sdkForProject.avatars.getBrowser(session.clientCode, 32, 32).toString()}
								alt={session.clientName}
							/></TableCell
						>
						<TableCell>{session.countryName}</TableCell>
						<TableCell>{session.osName}</TableCell>
						<TableCell>{session.ip}</TableCell>
						<TableCell
							><Button on:click={() => deleteSession(session.$id)}>Logout</Button></TableCell
						>
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination
			{limit}
			bind:offset
			sum={response.total}
			on:change={() => (request = getSessions())}
		/>
		<Button on:click={deleteAllSessions}>Logout from all sessions</Button>
	{/await}
</Card>
