<script lang="ts">
    import { Card } from '$lib/components';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import {
        IconGithub,
        IconReact,
        IconSvelte,
        IconNuxt,
        IconVue,
        IconGitBranch
    } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';

    export let framework: Models.Framework;
    export let repositoryName: string;
    export let branch: string;
    export let rootDir: string;

    function getIcon(fr: string) {
        switch (true) {
            case fr.toLocaleLowerCase().includes('sveltekit'):
                return IconSvelte;
            case fr.toLocaleLowerCase().includes('nuxt'):
                return IconNuxt;
            case fr.toLocaleLowerCase().includes('vue'):
                return IconVue;
            case fr.toLocaleLowerCase().includes('react'):
                return IconReact;
            default:
                return undefined;
        }
    }
</script>

<Card padding="x-small">
    <Layout.Stack gap="l">
        <slot />
        <Layout.Stack gap="l">
            {#if framework?.name}
                {@const frameworkIcon = getIcon(framework.name)}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Framework</Typography.Caption>
                    <Layout.Stack gap="xs" alignItems="center" direction="row">
                        {#if frameworkIcon}
                            <Icon size="s" icon={frameworkIcon}></Icon>
                        {/if}
                        {framework.name}
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if repositoryName}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Git repository</Typography.Caption>
                    <Layout.Stack gap="xs" alignItems="center" direction="row">
                        <Icon size="s" icon={IconGithub}></Icon>
                        <Typography.Text variant="m-500">{repositoryName}</Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if branch}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Branch</Typography.Caption>
                    <Layout.Stack gap="xs" alignItems="center" direction="row">
                        <Icon size="s" icon={IconGitBranch}></Icon>
                        <Typography.Text variant="m-500">
                            {branch}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if rootDir}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Root directory</Typography.Caption>
                    <Typography.Text variant="m-500">
                        {rootDir}
                    </Typography.Text>
                </Layout.Stack>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Card>
