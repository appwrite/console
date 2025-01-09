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
    import { Layout } from '@appwrite.io/pink-svelte';

    export let site: Models.Site;
    let spa = false;
    let fallback = '';

    onMount(async () => {
        spa = site?.adapter === 'static';
        fallback ??= site.fallbackFile;
        if (fallback !== undefined) spa = true;
    });

    async function updateSPA() {
        try {
            console.log(spa);
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
                spa ? 'static' : 'ssr',
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

        <svelte:fragment slot="aside">
            <InputChoice
                id="spa"
                type="switchbox"
                label="Single page application (SPA)"
                bind:value={spa}>
                <Layout.Stack>
                    Provide a fallback file for advanced routing and proper page handling in SPA
                    mode.
                    {#if spa}
                        <InputText
                            id="fallback"
                            label="Fallback"
                            placeholder="Enter fallback"
                            bind:value={fallback} />
                    {/if}
                </Layout.Stack>
            </InputChoice>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={spa ? site.adapter === 'static' : site.adapter === 'ssr'} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
