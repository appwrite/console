<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, SvgIcon } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '$routes/(console)/project-[project]/store';
    import { Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { func } from '../store';
    import { capitalize } from '$lib/helpers/string';
</script>

<CardGrid>
    <Typography.Title size="s">{$func.name}</Typography.Title>

    <svelte:fragment slot="aside">
        <Layout.Stack gap="xxxl" direction="row" wrap="wrap">
            <Layout.Stack gap="xxxs" inline>
                <Typography.Caption variant="400">Runtime</Typography.Caption>
                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                    <Layout.Stack direction="row" gap="xxs" alignItems="center">
                        <SvgIcon size={16} iconSize="small" name={$func.runtime.split('-')[0]} />
                        {capitalize($func.runtime)}
                    </Layout.Stack>
                </Typography.Text>
            </Layout.Stack>
            <Layout.Stack gap="xxxs" inline>
                <Typography.Caption variant="400">Updated</Typography.Caption>
                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                    {toLocaleDateTime($func.$updatedAt)}
                </Typography.Text>
            </Layout.Stack>
            <Layout.Stack gap="xxxs" inline>
                <Typography.Caption variant="400">Created</Typography.Caption>
                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                    {toLocaleDateTime($func.$createdAt)}
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            secondary
            href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}>
            Execute
        </Button>
    </svelte:fragment>
</CardGrid>
