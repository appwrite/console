<script>
    import { Divider, Typography, Card, Layout, Status } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import Placeholder from './assets/placeholder.svg';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const { data } = $props();

    async function createArtifact() {
        const artifact = await sdk.forProject.imagine.create(ID.unique());

        await goto(`${base}/project-${page.params.project}/studio/artifact-${artifact.$id}`);
        invalidate(Dependencies.ARTIFACTS);
    }
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary"
            >Artifacts</Typography.Text>

        <Button size="s" on:click={createArtifact} event="create_artifact">Create artifact</Button>
    </Layout.Stack>

    <Divider />
    <Layout.Grid gap="l" columnsS={1} columns={3} columnsL={3} columnsXL={4}>
        {#each data.artifacts.artifacts as artifact}
            <a href={`${base}/project-${page.params.project}/studio/artifact-${artifact.$id}`}>
                <Card.Base padding="xxs">
                    <Layout.Stack gap="xs">
                        <img
                            src={Placeholder}
                            alt={`Screenshot of latest ${artifact.name} version`} />
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            {artifact.name}
                        </Typography.Text>
                        <Status status="waiting" label="Not released"></Status>
                    </Layout.Stack>
                </Card.Base></a>
        {/each}
    </Layout.Grid>
</Layout.Stack>
