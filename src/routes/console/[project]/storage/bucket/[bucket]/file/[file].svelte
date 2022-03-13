<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';

	const bucket = $page.params.bucket;
	const request = sdkForProject.storage.getFile($page.params.bucket, $page.params.file);

	const deleteFile = async () => {
		try {
			if (!confirm('Are you sure you want to delete that file?')) {
				return;
			}

			await sdkForProject.storage.deleteFile(bucket, $page.params.file);
			await goto(`/console/${$page.params.project}/storage`);
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

{#await request}
	<div aria-busy="true" />
{:then file}
	<p>Name: {file.name}</p>
	<p>Type: {file.mimeType}</p>
	<p>Size: {file.sizeOriginal}</p>
	<p>Create: {file.dateCreated}</p>
{/await}

<Button secondary on:click={deleteFile}>Delete File</Button>
