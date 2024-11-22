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
    import { consoleVariables } from '$routes/(console)/store';

    export let frameworkName: string = '';
    export let repositoryName: string;
    export let branch: string;
    export let rootDir: string;
    export let domain: string = '';
    export let showAfter = true;

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

<Card padding="xs">
    <Layout.Stack gap="l">
        <slot />
        <Layout.Stack gap="l">
            {#if frameworkName}
                {@const frameworkIcon = getIcon(frameworkName)}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Framework</Typography.Caption>
                    <Layout.Stack gap="xs" alignItems="center" direction="row">
                        {#if frameworkIcon}
                            <Icon size="s" icon={frameworkIcon}></Icon>
                        {/if}
                        <Typography.Text variant="m-500" color="--color-fgcolor-neutral-primary">
                            {frameworkName}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if repositoryName && showAfter}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Git repository</Typography.Caption>
                    <Layout.Stack gap="xs" alignItems="center" direction="row">
                        <Icon size="s" icon={IconGithub}></Icon>
                        <Typography.Text variant="m-500" color="--color-fgcolor-neutral-primary">
                            {repositoryName}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if branch && showAfter}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Branch</Typography.Caption>
                    <Layout.Stack gap="xs" alignItems="center" direction="row">
                        <Icon size="s" icon={IconGitBranch}></Icon>
                        <Typography.Text variant="m-500" color="--color-fgcolor-neutral-primary">
                            {branch}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            {#if rootDir && showAfter}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Root directory</Typography.Caption>
                    <Typography.Text variant="m-500" color="--color-fgcolor-neutral-primary">
                        {rootDir}
                    </Typography.Text>
                </Layout.Stack>
            {/if}
            {#if domain && showAfter}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Domain</Typography.Caption>
                    <Typography.Text
                        variant="m-500"
                        color="--color-fgcolor-neutral-primary"
                        truncate>
                        {$consoleVariables._APP_OPTIONS_FORCE_HTTPS
                            ? 'https://'
                            : 'http://'}{domain}.{$consoleVariables._APP_DOMAIN_TARGET}
                    </Typography.Text>
                </Layout.Stack>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Card>
