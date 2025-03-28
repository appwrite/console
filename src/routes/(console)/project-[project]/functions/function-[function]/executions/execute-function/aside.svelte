<script lang="ts">
    import { Card, Id } from '$lib/components';
    import { Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import type { Models } from '@appwrite.io/console';
    import { DeploymentCreatedBy, DeploymentDomains, DeploymentSource } from '$lib/components/git';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { timer } from '$lib/actions/timer';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';

    export let deployment: Models.Deployment;
    export let proxyRuleList: Models.ProxyRuleList;
</script>

<Card padding="s" radius="s">
    <Layout.Stack gap="xl">
        <slot />
        <Layout.Stack gap="l">
            <Layout.Stack gap="xxxs">
                <Typography.Caption variant="400">Deployment ID</Typography.Caption>

                <Id value={deployment.$id}>
                    {deployment.$id}
                </Id>
            </Layout.Stack>

            <Layout.Stack gap="xxxs">
                <Typography.Caption variant="400">Build duration</Typography.Caption>
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                    {#if ['processing', 'building'].includes(deployment.status)}
                        <span use:timer={{ start: deployment.$createdAt }}></span>
                    {:else}
                        {formatTimeDetailed(deployment.buildDuration)}
                    {/if}
                </Typography.Text>
            </Layout.Stack>
            <Layout.Stack gap="xxxs">
                <Typography.Caption variant="400">Size</Typography.Caption>
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                    <Layout.Stack gap="xxs" alignItems="center" direction="row">
                        {humanFileSize(deployment.sourceSize + deployment.buildSize).value +
                            humanFileSize(deployment.sourceSize + deployment.buildSize).unit}
                        <Tooltip>
                            <Icon icon={IconInfo} color="--fgcolor-neutral-tertiary" size="s" />
                            <span slot="tooltip">
                                <p>
                                    <b>Deployment size:</b>
                                    {humanFileSize(deployment.sourceSize).value +
                                        humanFileSize(deployment.sourceSize).unit}
                                </p>
                                <p>
                                    <b>Build size:</b>
                                    {humanFileSize(deployment.buildSize).value +
                                        humanFileSize(deployment.buildSize).unit}
                                </p>
                            </span>
                        </Tooltip>
                    </Layout.Stack>
                </Typography.Text>
            </Layout.Stack>
            <Layout.Stack gap="xxxs">
                <Typography.Caption variant="400">Source</Typography.Caption>
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                    <DeploymentSource {deployment} />
                </Typography.Text>
            </Layout.Stack>
            {#if proxyRuleList?.total}
                <Layout.Stack gap="xxxs">
                    <Typography.Caption variant="400">Domains</Typography.Caption>
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        <DeploymentDomains domains={proxyRuleList} />
                    </Typography.Text>
                </Layout.Stack>
            {/if}

            <Layout.Stack gap="xxxs">
                <Typography.Caption variant="400">Updated</Typography.Caption>
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                    <DeploymentCreatedBy {deployment} />
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
</Card>
