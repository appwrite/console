<script lang="ts">
    import { Card, SvgIcon } from '$lib/components';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub, IconGitBranch } from '@appwrite.io/pink-icons-svelte';
    import type { Models, Runtime } from '@appwrite.io/console';

    export let runtime: Runtime;
    export let repositoryName: string = undefined;
    export let branch: string = undefined;
    export let rootDir: string = undefined;
    export let showGitData = true;
    export let runtimes: Models.RuntimeList;

    $: selectedRuntime = runtimes?.runtimes.find((r) => r.$id === runtime);

    $: console.log(runtimes);
</script>

<Card padding="s" radius="s">
    <Layout.Stack gap="xl">
        <slot />
        <Layout.Stack gap="l">
            {#if selectedRuntime?.name}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Runtime</Typography.Caption>
                    <Layout.Stack gap="xxs" alignItems="center" direction="row">
                        {#if selectedRuntime?.key}
                            <SvgIcon iconSize="small" size={16} name={selectedRuntime.key} />
                        {/if}
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            {selectedRuntime.name} - {selectedRuntime.version}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if showGitData}
                {#if repositoryName}
                    <Layout.Stack gap="xxxs">
                        <Typography.Caption variant="400">Git repository</Typography.Caption>
                        <Layout.Stack gap="xxs" alignItems="center" direction="row">
                            <Icon size="s" icon={IconGithub} color="--fgcolor-neutral-primary" />
                            <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                {repositoryName}
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
                {#if branch}
                    <Layout.Stack gap="xxxs">
                        <Typography.Caption variant="400">Branch</Typography.Caption>
                        <Layout.Stack gap="xxs" alignItems="center" direction="row">
                            <Icon size="s" icon={IconGitBranch} color="--fgcolor-neutral-primary" />
                            <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                {branch}
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}

                {#if rootDir}
                    <Layout.Stack gap="xxxs">
                        <Typography.Caption variant="400">Root directory</Typography.Caption>
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            {rootDir}
                        </Typography.Text>
                    </Layout.Stack>
                {/if}
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Card>
