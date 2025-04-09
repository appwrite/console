<script lang="ts">
    import { Card, Id, SvgIcon } from '$lib/components/index.js';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import {
        Badge,
        Divider,
        Icon,
        Layout,
        Status,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { DeploymentSource, DeploymentCreatedBy, DeploymentDomains } from '$lib/components/git';
    import { func } from '../store';
    import { capitalize } from '$lib/helpers/string';
    import { isCloud } from '$lib/system';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import Link from '$lib/elements/link.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Snippet } from 'svelte';

    // export let deployment: Models.Deployment;
    // export let proxyRuleList: Models.ProxyRuleList;
    // export let variant: 'primary' | 'secondary' = 'primary';
    // export let activeDeployment = false;

    let {
        deployment,
        proxyRuleList,
        variant = 'primary',
        activeDeployment = false,
        footer
    }: {
        deployment: Models.Deployment;
        proxyRuleList: Models.ProxyRuleList;
        variant?: 'primary' | 'secondary';
        activeDeployment?: boolean;
        footer?: Snippet;
    } = $props();

    let totalSize = $derived(humanFileSize(deployment?.totalSize ?? 0));
</script>

{#snippet text(title: string, text: string)}
    <Layout.Stack gap="xxs" inline>
        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
            {title}
        </Typography.Text>
        <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
            {text}
        </Typography.Text>
    </Layout.Stack>
{/snippet}

{#snippet protection(text: string, tooltip: string)}
    <Layout.Stack gap="xxs" inline>
        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
            <Layout.Stack direction="row" gap="xxs" alignItems="center">
                {text}
                <Tooltip>
                    <Icon icon={IconInfo} size="s" />
                    <span slot="tooltip">
                        {tooltip}
                    </span>
                </Tooltip>
            </Layout.Stack>
        </Typography.Text>
        <Layout.Stack inline alignItems="flex-start">
            <Badge
                size="xs"
                variant="secondary"
                type={isCloud ? 'success' : null}
                content={isCloud ? 'Connected' : 'Available on Cloud'} />
        </Layout.Stack>
    </Layout.Stack>
{/snippet}

<Card padding="m" radius="m" {variant}>
    <Layout.Stack gap="xxl">
        <Layout.GridFraction start={4} end={6}>
            <Layout.Stack>
                <Layout.Stack direction="row" alignItems="center" gap="s" wrap="wrap">
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

                        {#if $func.deploymentId === deployment.$id}
                            <DeploymentDomains domains={proxyRuleList} />
                        {:else}
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                Only the <Link
                                    href={`${base}/project-${page.params.project}/functions/function-${$func.$id}/deployment-${$func.deploymentId}`}
                                    variant="default">active deployment</Link> has a domain.
                            </Typography.Text>
                        {/if}
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
                            {@render text(
                                'Build duration',
                                formatTimeDetailed(deployment.buildDuration)
                            )}
                        {/if}
                        {@render text('Total size', `${totalSize.value} ${totalSize.unit}`)}

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

                    {@render protection(
                        'Global CDN',
                        'Optimized speed by caching content on servers closer to users.'
                    )}
                    {@render protection(
                        'DDoS protection',
                        'Safeguards your site by detecting and blocking malicious traffic.'
                    )}
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

        {#if footer}
            <span
                style="margin-left: calc(-1* var(--space-9));margin-right: calc(-1* var(--space-9));width:auto;">
                <Divider />
            </span>
            <Layout.Stack direction="row-reverse">
                {@render footer()}
            </Layout.Stack>
        {/if}
    </Layout.Stack>
</Card>
