<script lang="ts">
    import { Trim } from '$lib/components';
    import { Link } from '$lib/elements';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import {
        IconCode,
        IconExclamation,
        IconGitBranch,
        IconGitCommit,
        IconGithub,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Layout, Popover, Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    let {
        deployment,
        resource,
        region,
        project
    }: {
        deployment: Models.Deployment;
        resource?: Models.Site | Models.Function;
        region?: string;
        project?: string;
    } = $props();

    let authorized = $state(null);

    async function loadAuthorized() {
        if (!resource?.installationId || !resource?.providerRepositoryId || !region || !project) {
            return;
        }

        try {
            const repository = await sdk.forProject(region, project).vcs.getRepository({
                installationId: resource.installationId,
                providerRepositoryId: resource.providerRepositoryId
            });
            authorized = repository.authorized;
        } catch (err) {
            console.warn(err);
        }
    }

    onMount(() => {
        loadAuthorized();
    });
</script>

{#if deployment.type === 'vcs'}
    <Popover padding="none" let:toggle>
        <div>
            <Layout.Stack direction="row" gap="xs" alignItems="center">
                <Link
                    on:click={(e) => {
                        e.preventDefault();
                        toggle(e);
                    }}>
                    <Layout.Stack direction="row" gap="xs" alignItems="center">
                        <Icon icon={IconGithub} size="s" /> GitHub
                    </Layout.Stack>
                </Link>
                {#if authorized === false}
                    <Tooltip>
                        <Icon icon={IconExclamation} size="s" color="--bgcolor-warning" />
                        <span slot="tooltip">
                            Integration not authorized for auto deployments.<br />
                            To enable, add the repository to the installation settings.
                        </span>
                    </Tooltip>
                {/if}
            </Layout.Stack>
        </div>
        <svelte:fragment slot="tooltip">
            <ActionMenu.Root>
                <ActionMenu.Item.Anchor
                    href={deployment.providerRepositoryUrl}
                    external
                    leadingIcon={IconGithub}>
                    {deployment.providerRepositoryOwner}/{deployment.providerRepositoryName}
                </ActionMenu.Item.Anchor>
                <ActionMenu.Item.Anchor
                    href={deployment.providerBranchUrl}
                    external
                    leadingIcon={IconGitBranch}>
                    {deployment.providerBranch}
                </ActionMenu.Item.Anchor>
                {#if deployment?.providerCommitMessage && deployment?.providerCommitHash && deployment?.providerCommitUrl}
                    <ActionMenu.Item.Anchor
                        href={deployment.providerCommitUrl}
                        external
                        leadingIcon={IconGitCommit}>
                        <Trim alternativeTrim>
                            {deployment?.providerCommitHash?.substring(0, 7)}
                            {deployment.providerCommitMessage.substring(0, 15)}...
                        </Trim>
                    </ActionMenu.Item.Anchor>
                {/if}
            </ActionMenu.Root>
        </svelte:fragment>
    </Popover>
{:else if deployment.type === 'manual'}
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <Icon icon={IconCode} size="s" /> <span>Manual</span>
    </Layout.Stack>
{:else if deployment.type === 'cli'}
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <Icon icon={IconTerminal} size="s" /> <span>CLI</span>
    </Layout.Stack>
{:else}
    <span>N/A</span>
{/if}
