<script lang="ts">
    import { Trim } from '$lib/components';
    import { Link } from '$lib/elements';
    import type { Models } from '@appwrite.io/console';
    import {
        IconCode,
        IconGitBranch,
        IconGitCommit,
        IconGithub,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Layout, Popover, Icon } from '@appwrite.io/pink-svelte';

    export let deployment: Models.Deployment;
</script>

{#if deployment.type === 'vcs'}
    <Popover padding="none" let:toggle>
        <div>
            <Link
                on:click={(e) => {
                    e.preventDefault();
                    toggle(e);
                }}>
                <Layout.Stack direction="row" gap="xs" alignItems="center">
                    <Icon icon={IconGithub} size="s" /> GitHub
                </Layout.Stack>
            </Link>
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
