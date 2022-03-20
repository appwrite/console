<script lang="ts">
	import { Card } from '$lib/components';
	import { Container } from '$lib/layout';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { page } from '$app/stores';

	const projectId = $page.params.project;
	const keyId = $page.params.key;
	const request = sdkForConsole.projects.getKey(projectId, keyId);
</script>

<Container>
	<Card>
		{#await request}
			loading
		{:then response}
			<p>{response.name}</p>
		{/await}
	</Card>
</Container>
