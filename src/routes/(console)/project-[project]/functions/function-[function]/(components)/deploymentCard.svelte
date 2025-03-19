<script lang="ts">
    import { Card, Id, SvgIcon } from '$lib/components/index.js';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import { Divider, Layout, Status, Typography } from '@appwrite.io/pink-svelte';
    import { DeploymentSource, DeploymentCreatedBy, DeploymentDomains } from '$lib/components/git';

    import { func } from '../store';
    import { capitalize } from '$lib/helpers/string';

    export let deployment: Models.Deployment;
    export let proxyRuleList: Models.ProxyRuleList;
    export let variant: 'primary' | 'secondary' = 'primary';
    export let activeDeployment = false;

    $: totalSize = humanFileSize((deployment?.buildSize ?? 0) + (deployment?.sourceSize ?? 0));
</script>

<Card padding="m" radius="m" {variant}>
    <Layout.Stack gap="xxl">
        <Layout.GridFraction start={4} end={6}>
            <Layout.Stack>
                <Layout.Stack direction="row" alignItems="center" gap="s">
                    {#if activeDeployment}
                        <Typography.Title
                            size="s"
                            variant="l-500"
                            color="--fgcolor-neutral-primary">
                            Active deployment
                        </Typography.Title>
                        <div>
                            <Id value={deployment.$id}>
                                {deployment.$id}
                            </Id>
                        </div>
                    {:else}
                        <Typography.Title
                            size="s"
                            variant="l-500"
                            color="--fgcolor-neutral-primary">
                            Deployment overview
                        </Typography.Title>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
            <Layout.Stack gap="xl">
                <Layout.Stack direction="row" alignItems="flex-start">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            Domains
                        </Typography.Text>

                        <DeploymentDomains domains={proxyRuleList} />
                    </Layout.Stack>
                </Layout.Stack>

                <Layout.Stack direction="row" gap="xl">
                    {#if deployment.status === 'failed'}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Status
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                <Status status={deployment.status} label={deployment.status} />
                            </Typography.Text>
                        </Layout.Stack>
                    {:else}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Deployed
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                <DeploymentCreatedBy {deployment} />
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>

                <Layout.Stack gap="xxl" direction="row" wrap="wrap">
                    <Layout.Stack gap="xxl" direction="row" wrap="wrap" inline>
                        {#if deployment?.buildDuration}
                            <Layout.Stack gap="xxs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Build duration
                                </Typography.Text>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                    {formatTimeDetailed(deployment.buildDuration)}
                                </Typography.Text>
                            </Layout.Stack>
                        {/if}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Total size
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                {totalSize.value}{totalSize.unit}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Runtime
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                    <SvgIcon
                                        size={16}
                                        iconSize="small"
                                        name={$func.runtime.split('-')[0]} />
                                    {capitalize($func.runtime)}
                                </Layout.Stack>
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                </Layout.Stack>
                <Layout.Stack gap="xxs" inline style="width: min-content;">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        Source
                    </Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                        <div>
                            <DeploymentSource {deployment} />
                        </div>
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </Layout.GridFraction>

        {#if $$slots.footer}
            <span
                style="margin-left: calc(-1* var(--space-9));margin-right: calc(-1* var(--space-9));width:auto;">
                <Divider />
            </span>
            <Layout.Stack direction="row-reverse">
                <slot name="footer" />
            </Layout.Stack>
        {/if}
    </Layout.Stack>
</Card>
