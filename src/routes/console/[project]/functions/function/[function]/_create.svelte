<script lang="ts">
	import { InputBoolean, Button, InputFile, InputText } from '$lib/elements/forms';
	import { Modal } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { addNotification } from '$lib/stores/notifications';
	import { page } from '$app/stores';

	export let showCreate = false;

	let showCli = true;
	let entrypoint: string;
	let code: FileList;
	let active: boolean;

	const functionId = $page.params.function;
	const dispatch = createEventDispatcher();

	const create = async () => {
		try {
			await sdkForProject.functions.createDeployment(functionId, entrypoint, code[0], active);
			code = entrypoint = active = null;
			showCreate = false;
			dispatch('created');
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show={showCreate}>
		<svelte:fragment slot="header">Create Deployment</svelte:fragment>
		<ul class="tabs">
			<li class="tabs-item">
				<span class="tabs-button" on:click={() => (showCli = true)} class:is-selected={showCli}>
					<span class="text">Files</span>
				</span>
			</li>
			<li class="tabs-item">
				<span class="tabs-button" on:click={() => (showCli = false)} class:is-selected={!showCli}>
					<span class="text">Usage</span>
				</span>
			</li>
		</ul>
		{#if showCli}
			<p>Unix</p>
			<p>Powershell</p>
			<p>Learn more about creating deployments, installing and using the Appwrite CLI.</p>
		{:else}
			<InputText id="entrypoint" label="Entrypoint" bind:value={entrypoint} required />
			<InputFile id="file" label="File" bind:files={code} required />
			<InputBoolean id="active" label="Activate Deployment after build" bind:value={active} />
		{/if}
		<svelte:fragment slot="footer">
			<Button submit>Create</Button>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
		</svelte:fragment>
	</Modal>
</form>
