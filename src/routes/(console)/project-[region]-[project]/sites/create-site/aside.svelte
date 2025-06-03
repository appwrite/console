<script lang="ts">
    import { Card, SvgIcon, Trim } from '$lib/components';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub, IconGitBranch } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    export let framework: Partial<Models.Framework>;
    export let repositoryName: string;
    export let branch: string;
    export let rootDir: string;
    export let domain: string = '';
    export let showAfter = true;
</script>

<Card padding="s" radius="s">
    <Layout.Stack gap="xl">
        <slot />
        <Layout.Stack gap="l">
            {#if repositoryName && showAfter}
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
            {#if branch && showAfter}
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

            {#if rootDir && showAfter}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Root directory</Typography.Caption>
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        {rootDir}
                    </Typography.Text>
                </Layout.Stack>
            {/if}
            {#if framework?.name}
                {@const frameworkIcon = getFrameworkIcon(framework.key)}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Framework</Typography.Caption>
                    <Layout.Stack gap="xxs" alignItems="center" direction="row">
                        {#if frameworkIcon}
                            <SvgIcon iconSize="small" size={16} name={frameworkIcon} />
                        {/if}
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            {framework.name}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}

            {#if domain && showAfter}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Domain</Typography.Caption>

                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        {#key domain}
                            <Trim alternativeTrim>
                                {$regionalConsoleVariables._APP_OPTIONS_FORCE_HTTPS
                                    ? 'https://'
                                    : 'http://'}{domain}
                            </Trim>
                        {/key}
                    </Typography.Text>
                </Layout.Stack>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Card>
