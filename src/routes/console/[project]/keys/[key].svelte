<script lang="ts">
	import { page } from '$app/stores';
	import { Back } from '$lib/components';

	const projectId = $page.params.project;
</script>

<Back href={`/console/${projectId}/keys`}>API Keys</Back>
