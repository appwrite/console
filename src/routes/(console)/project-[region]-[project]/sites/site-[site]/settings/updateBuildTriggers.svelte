<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputTags } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { Input, Layout } from '@appwrite.io/pink-svelte';

    export let site: Models.Site;

    type SiteWithTriggers = Models.Site & { providerBranches?: string[]; providerPaths?: string[] };

    function normalizeTriggerPatterns(patterns: string[] = []) {
        return [...new Set(patterns.map((pattern) => pattern.trim()).filter(Boolean))];
    }

    let providerBranches: string[] = normalizeTriggerPatterns(
        (site as SiteWithTriggers).providerBranches
    );
    let providerPaths: string[] = normalizeTriggerPatterns(
        (site as SiteWithTriggers).providerPaths
    );
    let savedBranches = normalizeTriggerPatterns((site as SiteWithTriggers).providerBranches);
    let savedPaths = normalizeTriggerPatterns((site as SiteWithTriggers).providerPaths);

    async function update() {
        providerBranches = normalizeTriggerPatterns(providerBranches);
        providerPaths = normalizeTriggerPatterns(providerPaths);

        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: site.framework as Framework,
                enabled: site.enabled ?? undefined,
                logging: site.logging ?? undefined,
                timeout: site.timeout ?? undefined,
                installCommand: site.installCommand ?? undefined,
                buildCommand: site.buildCommand ?? undefined,
                startCommand: site.startCommand ?? undefined,
                outputDirectory: site.outputDirectory ?? undefined,
                buildRuntime: (site.buildRuntime as BuildRuntime) ?? undefined,
                adapter: (site.adapter as Adapter) ?? undefined,
                fallbackFile: site.fallbackFile ?? undefined,
                installationId: site.installationId ?? undefined,
                providerRepositoryId: site.providerRepositoryId ?? undefined,
                providerBranch: site.providerBranch ?? undefined,
                providerSilentMode: site.providerSilentMode ?? undefined,
                providerRootDirectory: site.providerRootDirectory ?? undefined,
                buildSpecification: site.buildSpecification ?? undefined,
                providerBranches,
                providerPaths
            });
            savedBranches = [...providerBranches];
            savedPaths = [...providerPaths];
            await invalidate(Dependencies.SITE);
            addNotification({
                type: 'success',
                message: 'Build triggers have been updated successfully'
            });
            trackEvent(Submit.SiteUpdateConfiguration);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SiteUpdateConfiguration);
        }
    }

    $: isDisabled =
        !symmetricDifference(providerBranches, savedBranches).length &&
        !symmetricDifference(providerPaths, savedPaths).length;
</script>

{#if site.providerRepositoryId}
    <Form onSubmit={update}>
        <CardGrid>
            <svelte:fragment slot="title">Build triggers</svelte:fragment>
            Control which branch pushes and file changes trigger automatic deployments. Use glob patterns
            to include or exclude specific branches and paths.
            <svelte:fragment slot="aside">
                <Layout.Stack gap="xl">
                    <Layout.Stack gap="s">
                        <InputTags
                            id="providerBranches"
                            label="Branch filters"
                            placeholder={providerBranches.length
                                ? ''
                                : 'e.g. main, feat/*, !hotfix/*'}
                            bind:tags={providerBranches} />
                        <Input.Helper state="default"
                            >Leave empty to deploy on all branches. Prefix with <code>!</code> to exclude.</Input.Helper>
                    </Layout.Stack>
                    <Layout.Stack gap="s">
                        <InputTags
                            id="providerPaths"
                            label="Path filters"
                            placeholder={providerPaths.length ? '' : 'e.g. src/**, !docs/**'}
                            bind:tags={providerPaths} />
                        <Input.Helper state="default"
                            >Leave empty to deploy on all file changes. Prefix with <code>!</code>
                            to exclude.</Input.Helper>
                    </Layout.Stack>
                </Layout.Stack>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button disabled={isDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
{/if}
