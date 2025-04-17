<script>
    import {
        Badge,
        Divider,
        Icon,
        Typography,
        Card,
        Layout,
        Table,
        Status
    } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { artifacts } from '$routes/(console)/project-[project]/store.js';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import Placeholder from './assets/placeholder.svg';

    const projectId = page.data?.project?.$id ?? '';
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary"
            >Artifacts</Typography.Text>

        <Button size="s" on:click={() => {}} event="create_project">Create artifact</Button>
    </Layout.Stack>

    <Divider />
    <Layout.Grid gap="l" columnsS={1} columns={3} columnsL={3} columnsXL={4}>
        {#each $artifacts as artifact}
            <a href={`${base}/project-${projectId}/studio/artifact-${artifact.$id}`}>
                <Card.Base padding="xxs">
                    <Layout.Stack gap="xs">
                        <img
                            src={Placeholder}
                            alt={`Screenshot of latest ${artifact.title} version`} />
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary"
                            >{artifact.title}</Typography.Text>
                        <Status
                            status={artifact.url ? 'complete' : 'waiting'}
                            label={artifact.url ?? 'Not released'}></Status>
                    </Layout.Stack>
                </Card.Base></a>
        {/each}
    </Layout.Grid>
</Layout.Stack>
