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
    import { type Models, Runtime, type Scopes } from '@appwrite.io/console';
    import { Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let func: Models.Function;

    type FuncWithTriggers = Models.Function & {
        providerBranches?: string[];
        providerPaths?: string[];
    };

    function normalizeTriggerPatterns(patterns: string[] = []) {
        return [...new Set(patterns.map((pattern) => pattern.trim()).filter(Boolean))];
    }

    let providerBranches: string[] = normalizeTriggerPatterns(
        (func as FuncWithTriggers).providerBranches
    );
    let providerPaths: string[] = normalizeTriggerPatterns(
        (func as FuncWithTriggers).providerPaths
    );
    let savedBranches = normalizeTriggerPatterns((func as FuncWithTriggers).providerBranches);
    let savedPaths = normalizeTriggerPatterns((func as FuncWithTriggers).providerPaths);

    async function update() {
        providerBranches = normalizeTriggerPatterns(providerBranches);
        providerPaths = normalizeTriggerPatterns(providerPaths);

        try {
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId: func.$id,
                name: func.name,
                runtime: func.runtime as Runtime,
                execute: func.execute?.length ? (func.execute as string[]) : undefined,
                events: func.events?.length ? (func.events as string[]) : undefined,
                schedule: func.schedule ?? undefined,
                timeout: func.timeout ?? undefined,
                enabled: func.enabled ?? undefined,
                logging: func.logging ?? undefined,
                entrypoint: func.entrypoint ?? undefined,
                commands: func.commands ?? undefined,
                scopes: func.scopes?.length ? (func.scopes as Scopes[]) : undefined,
                installationId: func.installationId ?? undefined,
                providerRepositoryId: func.providerRepositoryId ?? undefined,
                providerBranch: func.providerBranch ?? undefined,
                providerSilentMode: func.providerSilentMode ?? undefined,
                providerRootDirectory: func.providerRootDirectory ?? undefined,
                buildSpecification: func.buildSpecification ?? undefined,
                deploymentRetention: func.deploymentRetention ?? undefined,
                providerBranches,
                providerPaths
            });
            savedBranches = [...providerBranches];
            savedPaths = [...providerPaths];
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Build triggers have been updated successfully'
            });
            trackEvent(Submit.FunctionUpdateConfiguration);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateConfiguration);
        }
    }

    $: isDisabled =
        !symmetricDifference(providerBranches, savedBranches).length &&
        !symmetricDifference(providerPaths, savedPaths).length;
</script>

{#if func.providerRepositoryId}
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
                            bind:tags={providerBranches}>
                            <Tooltip slot="info">
                                <Icon icon={IconInfo} size="s" />
                                <span slot="tooltip"
                                    >Leave empty to deploy on all branches. Prefix with ! to
                                    exclude.</span>
                            </Tooltip>
                        </InputTags>
                    </Layout.Stack>
                    <Layout.Stack gap="s">
                        <InputTags
                            id="providerPaths"
                            label="Path filters"
                            placeholder={providerPaths.length ? '' : 'e.g. src/**, !docs/**'}
                            bind:tags={providerPaths}>
                            <Tooltip slot="info">
                                <Icon icon={IconInfo} size="s" />
                                <span slot="tooltip"
                                    >Leave empty to deploy on all file changes. Prefix with ! to
                                    exclude.</span>
                            </Tooltip>
                        </InputTags>
                    </Layout.Stack>
                </Layout.Stack>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button disabled={isDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
{/if}
