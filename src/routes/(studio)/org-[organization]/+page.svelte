<script lang="ts">
    import { Card, Typography, Layout, Divider, Button } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';

    export let data;
</script>

<Card.Base>
    <Layout.Stack>
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary"
                >Projects</Typography.Text>
            <Button.Button size="s">Create project</Button.Button>
        </Layout.Stack>

        <Divider />

        <Layout.Grid gap="l" columnsS={3} columns={4} columnsL={4} columnsXL={5}>
            {#each data.projects as project}
                <a href={`${base}/proj-${project.$id}`}
                    ><Card.Media
                        src="https://picsum.photos/260/150"
                        alt=""
                        description={project.description}
                        title={project.name}></Card.Media
                    ></a>
            {/each}
        </Layout.Grid>
    </Layout.Stack>
</Card.Base>
