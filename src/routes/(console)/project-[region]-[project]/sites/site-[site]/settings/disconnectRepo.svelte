<script lang="ts">
    import { invalidate } from '$app/navigation';
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
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site.framework as Framework,
                site.enabled || undefined,
                site.logging || undefined,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                (site?.buildRuntime as BuildRuntime) || undefined,
                (site?.adapter as Adapter) || undefined,
                site.fallbackFile || undefined,
                '',
                '',
                '',
                undefined,
                ''
            );
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
