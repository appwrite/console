<script lang="ts">
    import { Trim } from '$lib/components';
    import { Link } from '$lib/elements';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';
    import {
        IconCode,
        IconExclamation,
        IconGitBranch,
        IconGitCommit,
        IconGithub,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Layout,
        Popover,
        Icon,
        Skeleton,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import IconOrigin from './IconOrigin.svelte';

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

    let repository = $state<Models.ProviderRepository | null>(null);

    // The deployment's server-supplied URLs carry the provider; the model has
    // no provider field of its own.
    const isOrigin = $derived(
        (deployment?.providerRepositoryUrl ?? '').toLowerCase().includes('cursor.com')
    );

    async function loadRepository() {
        if (!resource?.installationId || !resource?.providerRepositoryId || !region || !project) {
            return;
        }

        try {
            repository = await sdk.forProject(region, project).vcs.getRepository({
                installationId: resource.installationId,
                providerRepositoryId: resource.providerRepositoryId
            });
        } catch (err) {
            console.warn(err);
        }
    }
</script>

{#if deployment.type === 'vcs'}
    <Popover padding="none" let:toggle>
        <div>
            {#await loadRepository()}
                <Layout.Stack direction="row" gap="xs" alignItems="center">
                    <Skeleton variant="line" width={100} height={20} />
                </Layout.Stack>
            {:then}
                <Layout.Stack direction="row" gap="xs" alignItems="center">
                    <Link
                        on:click={(e) => {
                            e.preventDefault();
                            toggle(e);
                        }}>
                        <Layout.Stack direction="row" gap="xs" alignItems="center">
                            {#if isOrigin}
                                <Icon icon={IconOrigin} size="s" /> Origin
                            {:else}
                                <Icon icon={IconGithub} size="s" /> GitHub
                            {/if}
                        </Layout.Stack>
                    </Link>
                    {#if repository?.authorized === false}
                        <Popover let:toggle placement="bottom-start">
                            <Button extraCompact on:click={toggle}>
                                <Icon icon={IconExclamation} size="s" color="--bgcolor-warning" />
                            </Button>
                            <svelte:fragment slot="tooltip">
                                <Typography.Text
                                    variant="m-400"
                                    color="--fgcolor-neutral-secondary">
                                    Integration not authorized for auto deployments.<br />
                                    To enable, add the repository to the installation settings on <Link
                                        variant="muted"
                                        external
                                        href={isOrigin
                                            ? 'https://cursor.com/codebase/settings/apps'
                                            : `https://github.com/settings/installations/${repository.providerInstallationId}`}>
                                        {isOrigin ? 'Origin' : 'GitHub'}
                                    </Link>.
                                </Typography.Text>
                            </svelte:fragment>
                        </Popover>
                    {/if}
                </Layout.Stack>
            {/await}
        </div>
        <svelte:fragment slot="tooltip">
            <ActionMenu.Root>
                <ActionMenu.Item.Anchor
                    href={deployment.providerRepositoryUrl}
                    external
                    leadingIcon={isOrigin ? IconOrigin : IconGithub}>
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
