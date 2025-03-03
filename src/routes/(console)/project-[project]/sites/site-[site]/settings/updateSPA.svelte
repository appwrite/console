<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';

    export let site: Models.Site;
    let fallback: null | string;

    onMount(async () => {
        fallback = site.fallbackFile;
    });

    async function updateSPA() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site?.framework as Framework,
                site.enabled || undefined,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                (site?.buildRuntime as BuildRuntime) || undefined,
                site.adapter || undefined,
                fallback,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined
            );
            await invalidate(Dependencies.SITE);
            addNotification({
                message: 'Settings have been updated',
                type: 'success'
            });
            trackEvent(Submit.SiteUpdateSinglePageApplication);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.SiteUpdateSinglePageApplication);
        }
    }
</script>

<Form onSubmit={updateSPA}>
    <CardGrid>
        <svelte:fragment slot="title">Single page application</svelte:fragment>
        Provide a fallback file for advanced routing and proper page handling in SPA mode.
        <svelte:fragment slot="aside">
            <InputChoice
                id="spa"
                type="switchbox"
                label="Single page application (SPA)"
                value={site.fallbackFile !== null}
                on:change={(value) => {
                    if (value.detail) {
                        fallback = '';
                    } else {
                        fallback = null;
                    }
                }} />

            {#if fallback !== null}
                <InputText
                    id="fallback"
                    label="Fallback"
                    placeholder="Enter fallback"
                    bind:value={fallback} />
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={fallback === site.fallbackFile} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
