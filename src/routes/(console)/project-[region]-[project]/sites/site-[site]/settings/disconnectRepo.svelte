<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Confirm } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Adapter, BuildRuntime, Framework, Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let site: Models.Site;
    let error = '';

    const dispatch = createEventDispatcher();

    async function handleSubmit() {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: site.framework as Framework,
                enabled: site.enabled || undefined,
                logging: site.logging || undefined,
                timeout: site.timeout || undefined,
                installCommand: site.installCommand || undefined,
                buildCommand: site.buildCommand || undefined,
                outputDirectory: site.outputDirectory || undefined,
                buildRuntime: (site?.buildRuntime as BuildRuntime) || undefined,
                adapter: (site?.adapter as Adapter) || undefined,
                fallbackFile: site.fallbackFile || undefined,
                installationId: '',
                providerRepositoryId: '',
                providerBranch: '',
                providerRootDirectory: ''
            });
            await invalidate(Dependencies.SITE);
            dispatch('success');
            addNotification({
                type: 'success',
                message: `Repository has been disconnected from your site`
            });
            trackEvent(Submit.SiteDisconnectRepo);
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SiteDisconnectRepo);
        }
    }

    $: if (!show) {
        error = '';
    }
</script>

<Confirm title="Disconnect Git repository" bind:open={show} bind:error onSubmit={handleSubmit}>
    <p data-private>
        Are you sure you want to disconnect <b>{site.name}</b>? This will affect future deployments
        to this site.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Disconnect</Button>
    </svelte:fragment>
</Confirm>
