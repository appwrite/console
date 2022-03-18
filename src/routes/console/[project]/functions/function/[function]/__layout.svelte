<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import { Cover } from '$lib/layout';
	import { func } from './store';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
	const functionId = $page.params.function;

	$: {
		if (browser) {
			func.load(functionId);
		}
	}
</script>

{#if $func}
	<Cover>
		<svelte:fragment slot="breadcrumbs">
			<Back href={`/console/${project}/functions`}>Functions</Back>
		</svelte:fragment>
		<svelte:fragment slot="title">{$func.name}</svelte:fragment>
		<Tabs />
	</Cover>

	<slot />
{/if}
