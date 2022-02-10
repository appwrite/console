<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { Button } from '$lib/elements/forms';
	import { sdkForProject } from '$lib/stores/sdk';

	const request = sdkForProject.storage.getFile($page.params.file);

	const deleteFile = async () => {
		try {
			if (!confirm('Are you sure you want to delete that file?')) {
				return;
			}

			await sdkForProject.storage.deleteFile($page.params.file);
			await goto(`/console/${$page.params.project}/storage`);
		} catch (error) {
			alert(error.message);
		}
	};
</script>

{#await request}
	<div aria-busy="true" />
{:then user}
	<p>Name: {user.name}</p>
	<p>Type: {user.mimeType}</p>
	<p>Size: {user.sizeOriginal}</p>
	<p>Create: {user.dateCreated}</p>
{/await}

<Button contrast on:click={deleteFile}>Delete File</Button>
