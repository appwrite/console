<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { func, execute } from './store';
    import Execute from './_execute.svelte';

    const functionId = $page.params.function;
    const path = `functions/function/${functionId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = func.load(functionId);
        if ($func?.$id !== functionId) {
            await promise;
        }

        updateLayout({
            navigate: event,
            title: $func.name,
            level: 4,
            back: `${base}/console/project-${$page.params.project}/functions`,
            copy: {
                text: 'ID Details',
                value: functionId
            },
            breadcrumbs: {
                title: $func.name,
                href: `function/${functionId}`
            },
            tabs: [
                {
                    href: path,
                    title: 'Deployments'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                },
                {
                    href: `${path}/executions`,
                    title: 'Executions'
                },
                {
                    href: `${path}/settings`,
                    title: 'Settings'
                }
            ]
        });
    }
</script>

{#if $func}
    <slot />
{/if}

{#if $execute?.selected}
    <Execute selectedDeployment={$execute.selected} bind:showExecute={$execute.show} />
{/if}
