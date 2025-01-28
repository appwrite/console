<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Badge, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import OpenOnMobileModal from '../(components)/openOnMobileModal.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import { IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import { protocol } from '$routes/(console)/store';
    import { type Models } from '@appwrite.io/console';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Card, Trim } from '$lib/components';

    export let proxyRuleList: Models.ProxyRuleList;

    let showDomainQR = false;
    let selectedDomainURL: string;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack gap="xs" direction="row" alignItems="center" inline>
            <Typography.Text variant="l-500">Domains</Typography.Text><Badge
                variant="secondary"
                content={proxyRuleList?.total.toString()}
                size="s" />
        </Layout.Stack>
        <Button
            secondary
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`}>
            View all
        </Button>
    </Layout.Stack>
    <Card padding="s" isTile>
        {#each proxyRuleList?.rules?.slice(0, 3) as rule, i}
            <Layout.Stack alignItems="center" justifyContent="space-between" direction="row">
                <Layout.Stack gap="xs" inline>
                    <Link variant="quiet-muted" href={`${$protocol}${rule.domain}`} external>
                        <Trim alternativeTrim>
                            {rule.domain}
                        </Trim>
                        <Icon icon={IconExternalLink} />
                    </Link>
                    <Typography.Text truncate>
                        Added {timeFromNow(rule.$createdAt)}
                    </Typography.Text>
                </Layout.Stack>
                <Button
                    icon
                    secondary
                    on:click={() => {
                        showDomainQR = true;
                        selectedDomainURL = rule.domain;
                        console.log(rule.domain);
                    }}>
                    <Icon icon={IconQrcode} />
                </Button>
            </Layout.Stack>
            {#if i < 2 && i < proxyRuleList.rules.length - 1}
                <Divider />
            {/if}
        {/each}
    </Card>
</Layout.Stack>

{#if showDomainQR && selectedDomainURL}
    <OpenOnMobileModal bind:show={showDomainQR} siteURL={selectedDomainURL} />
{/if}
