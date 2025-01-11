<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';

    export let site: Models.Site;
    let siteAdapter = 'static';
    let fallback = '';

    onMount(async () => {
        siteAdapter = site?.adapter ?? 'static';
        fallback ??= site.fallbackFile;

        // what was this check even for?
        // if (fallback !== undefined) siteAdapter = '';
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
                siteAdapter,
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
        <Heading tag="h6" size="7">Single page application</Heading>
        <p>Provide a fallback file for advanced routing and proper page handling in SPA mode.</p>

        <svelte:fragment slot="aside">
            <InputChoice
                id="spa"
                type="switchbox"
                label="Single page application (SPA)"
                on:change={(value) => {
                    if (value.detail) {
                        siteAdapter = 'static';
                    } else {
                        siteAdapter = 'ssr';
                    }
                }} />

            {#if siteAdapter === 'static'}
                <InputText
                    id="fallback"
                    label="Fallback"
                    placeholder="Enter fallback"
                    bind:value={fallback} />
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={siteAdapter === site.adapter} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
