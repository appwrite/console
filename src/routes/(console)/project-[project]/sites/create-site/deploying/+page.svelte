<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Fieldset, Card, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Aside from '../aside.svelte';
    import Logs from '../../(components)/logs.svelte';

    export let data;

    $: console.log(data.deployment);
</script>

<Wizard
    title="Create site"
    href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
    <Layout.Stack gap="xl">
        <Card.Base padding="s">
            <Layout.Stack direction="row">
                <Layout.Stack direction="row" alignItems="center">
                    <Typography.Text variant="m-500">{data.site.name}</Typography.Text>
                    <Tag size="s">{data.site.$id}</Tag>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
        <Fieldset legend="Deploy">
            <Logs bind:deployment={data.deployment} bind:site={data.site} />
        </Fieldset>
    </Layout.Stack>
    <svelte:fragment slot="aside">
        <Aside
            framework={data.frameworks.frameworks.find((f) => f.name === data.site.framework)}
            repositoryName={data.site.providerRepositoryId}
            branch={data.site.providerBranch}
            rootDir={data.site.providerRootDirectory}
            domain={data.deployment.domain} />
    </svelte:fragment>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Typography.Text variant="m-400" color="--color-fgColor-neutral-tertiary">
                Deployment will continue in the background
            </Typography.Text>
            <Button
                size="s"
                fullWidthMobile
                secondary
                href="{`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}}">
                Go to dashboard
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Wizard>
