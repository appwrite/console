<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
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

<Back href={`/console/${project}/functions`}>Functions</Back>
{#if $func}
	<h1>{$func.name}</h1>
	<Tabs />

	<slot />
{/if}
