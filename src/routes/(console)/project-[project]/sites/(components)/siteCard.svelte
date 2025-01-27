<script lang="ts">
    import { Card, Trim } from '$lib/components/index.js';
    import Link from '$lib/elements/link.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Image, Layout, Status, Typography } from '@appwrite.io/pink-svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import { Button } from '$lib/elements/forms';
    import { IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import OpenOnMobileModal from './openOnMobileModal.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';
    import { protocol } from '$routes/(console)/store';

    export let deployment: Models.Deployment;
    export let proxyRuleList: Models.ProxyRuleList = { total: 0, rules: [] };

    let show = false;
    const siteUrl =
        deployment.domain ?? (proxyRuleList.total > 0 ? proxyRuleList.rules[0].domain : undefined);

    $: totalSize = humanFileSize((deployment?.buildSize ?? 0) + (deployment?.size ?? 0));
</script>

<Card padding="xs">
    <Layout.Stack gap="m" direction="row">
        <Image
            width={445}
            height={280}
            src={`https://placehold.co/600x400/111/bbb?text=Screenshot+coming+soon&font=inter`}
            alt="Screenshot" />
        <Layout.Stack>
            <Layout.Stack direction="row" alignItems="flex-start">
                <Layout.Stack direction="row" gap="xl">
                    {#if deployment.status === 'failed'}
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Status
                            </Typography.Text>
                            <Typography.Text variant="m-400">
                                <Status status={deployment.status} label={deployment.status} />
                            </Typography.Text>
                        </Layout.Stack>
                    {:else}
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Deployed
                            </Typography.Text>
                            <DeploymentCreatedBy {deployment} />
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
                {#if siteUrl}
                    <Button icon text on:click={() => (show = true)}>
                        <Icon icon={IconQrcode} />
                    </Button>
                {/if}
            </Layout.Stack>
            {#if proxyRuleList?.total}
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Domains
                    </Typography.Text>
                    <DeploymentDomains domains={proxyRuleList} />
                </Layout.Stack>
            {:else if deployment.domain}
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Domains
                    </Typography.Text>
                    <Link external href={`${$protocol}${deployment.domain}`} variant="muted">
                        <Layout.Stack gap="xxs" direction="row" alignItems="center">
                            <Trim alternativeTrim>
                                {deployment.domain}
                            </Trim>
                            <Icon icon={IconExternalLink} size="s" />
                        </Layout.Stack>
                    </Link>
                </Layout.Stack>
            {/if}
            <Layout.Stack gap="xl" direction="row">
                {#if deployment?.buildTime}
                    <Layout.Stack gap="xs" inline>
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            Build time
                        </Typography.Text>
                        <Typography.Text variant="m-400">
                            {calculateTime(deployment.buildTime)}
                        </Typography.Text>
                    </Layout.Stack>
                {/if}
                <Layout.Stack gap="xs" inline>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Total size
                    </Typography.Text>
                    <Typography.Text variant="m-400">
                        {totalSize.value}{totalSize.unit}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
            <Layout.Stack gap="xs">
                <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                    Source
                </Typography.Text>
                <DeploymentSource {deployment} />
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
</Card>

{#if show && siteUrl}
    <OpenOnMobileModal bind:show siteURL={siteUrl} />
{/if}
