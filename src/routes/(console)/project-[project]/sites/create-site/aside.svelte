<script lang="ts">
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub, IconReact, IconGitBranch } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';

    export let isTemplate: boolean;
    export let template: Models.TemplateSite;
    export let name: string;
    export let framework: string;
    export let repositoryName: string;
    export let branch: string;
    export let rootDir: string;
</script>

{#if isTemplate}
    <Card padding="x-small">
        <Layout.Stack gap="m">
            {#if isTemplate}
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text variant="m-500" truncate>
                        {name || template.name}
                    </Typography.Text>

                    <Button secondary size="small">View demo</Button>
                </Layout.Stack>

                <Image src={template.preview} alt={template.name} width={357} height={200} />
            {/if}
            <Layout.Stack gap="s">
                {#if framework}
                    <Layout.Stack gap="xs">
                        <Typography.Caption variant="400">Framework</Typography.Caption>
                        <Layout.Stack gap="xs" alignItems="center" direction="row">
                            <Icon icon={IconReact}></Icon>
                            {framework}
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
                {#if repositoryName}
                    <Layout.Stack gap="xs">
                        <Typography.Caption variant="400">Git repository</Typography.Caption>
                        <Layout.Stack gap="xs" alignItems="center" direction="row">
                            <Icon icon={IconGithub}></Icon>
                            <Typography.Text variant="m-500">{repositoryName}</Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
                {#if branch}
                    <Layout.Stack gap="xs">
                        <Typography.Caption variant="400">Branch</Typography.Caption>
                        <Layout.Stack gap="xs" alignItems="center" direction="row">
                            <Icon icon={IconGitBranch}></Icon>
                            <Typography.Text variant="m-500">
                                {branch}
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
                {#if rootDir}
                    <Layout.Stack gap="xs">
                        <Typography.Caption variant="400">Root directory</Typography.Caption>
                        <Typography.Text variant="m-500">
                            {rootDir}
                        </Typography.Text>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Layout.Stack>
    </Card>
{:else}
    hi :)
{/if}
