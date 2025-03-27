<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Fieldset, Card, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Aside from '../aside.svelte';
    import Logs from '../../(components)/logs.svelte';
    import { getFrameworkIcon } from '../../store';
    import { Copy, SvgIcon } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { onMount } from 'svelte';
    import { Dependencies } from '$lib/constants';

    export let data;

    onMount(async () => {
        sdk.forConsole.client.subscribe('console', async (response) => {
            if (
                response.events.includes(
                    `sites.${data.deployment.resourceId}.deployments.${data.deployment.$id}.update`
                )
            ) {
                invalidate(Dependencies.DEPLOYMENT);
            }
        });
    });
</script>

<Wizard
    title="Create site"
    href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
    <Layout.Stack gap="xl">
        <Card.Base padding="s" radius="s">
            <Layout.Stack direction="row">
                <Layout.Stack direction="row" alignItems="center" gap="s">
                    <SvgIcon
                        iconSize="small"
                        size={16}
                        name={getFrameworkIcon(data.site.framework)} />
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        {data.site.name}
                    </Typography.Text>
                    <Copy value={data.site.$id}>
                        <Tag variant="code" size="xs">{data.site.$id}</Tag>
                    </Copy>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
        <Fieldset legend="Deploy">
            <Logs
                bind:deployment={data.deployment}
                hideScrollButtons
                height="calc(100dvh - 430px)"
                emptyCopy="No logs available yet..." />
        </Fieldset>
    </Layout.Stack>
    <svelte:fragment slot="aside">
        <Aside
            framework={data.frameworks.frameworks.find((f) => f.key === data.site.framework)}
            repositoryName={data?.repository?.name}
            branch={data.repository?.id ? data.site.providerBranch : ''}
            rootDir={data.repository?.id ? data.site.providerRootDirectory : ''} />
    </svelte:fragment>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            {#if ['processing', 'building'].includes(data.deployment.status)}
                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                    Deployment will continue in the background
                </Typography.Text>
            {/if}
            <Button
                size="s"
                fullWidthMobile
                secondary
                href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
                Go to dashboard
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Wizard>
