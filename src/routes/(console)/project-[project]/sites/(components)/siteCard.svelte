<script lang="ts">
    import { Card, Trim } from '$lib/components/index.js';
    import Link from '$lib/elements/link.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import { Button } from '$lib/elements/forms';
    import { IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import OpenOnMobileModal from './openOnMobileModal.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';
    import { consoleVariables } from '$routes/(console)/store';

    export let deployment: Models.Deployment;
    export let site: Models.Site;
    export let proxyRuleList: Models.ProxyRuleList;

    let rule = proxyRuleList?.total ? proxyRuleList.rules[0] : null;
    let show = false;

    $: totalSize = humanFileSize((deployment?.buildSize ?? 0) + (deployment?.size ?? 0));
</script>

<Card padding="xs">
    <Layout.Stack gap="m" direction="row">
        <Image
            width={445}
            height={280}
            src="https://f002.backblazeb2.com/file/meldiron-public/Desktop+-+2.png"
            alt="Screenshot" />
        <Layout.Stack>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Deployed
                    </Typography.Text>
                    <DeploymentCreatedBy {deployment} />
                </Layout.Stack>
                <Button icon text on:click={() => (show = true)}><Icon icon={IconQrcode} /></Button>
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
                    <Link
                        external
                        href={`${
                            $consoleVariables?._APP_OPTIONS_FORCE_HTTPS ? 'https://' : 'http://'
                        }${deployment.domain}`}
                        variant="muted">
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
                <Layout.Stack gap="xs" inline>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary"
                        >Build time</Typography.Text>
                    <Typography.Text variant="m-400"
                        >{calculateTime(deployment.buildTime)}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xs" inline>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary"
                        >Total size</Typography.Text>
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

{#if show}
    <OpenOnMobileModal bind:show siteURL={deployment.domain} />
{/if}
