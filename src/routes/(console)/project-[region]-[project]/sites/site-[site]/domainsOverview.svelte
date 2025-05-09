<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Badge, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import OpenOnMobileModal from '../(components)/openOnMobileModal.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import { IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import { protocol } from '$routes/(console)/store';
    import { type Models } from '@appwrite.io/console';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Card, Trim } from '$lib/components';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { RuleTrigger } from '$lib/stores/sdk';

    export let proxyRuleList: Models.ProxyRuleList;

    let showDomainQR = false;
    let selectedDomainURL: string;

    $: rules = proxyRuleList?.rules?.filter((rule) => rule.trigger === RuleTrigger.MANUAL) ?? [];
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack gap="xs" direction="row" alignItems="center" inline>
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
                Domains
            </Typography.Text>
            <Badge variant="secondary" content={(rules?.length ?? 0).toString()} size="s" />
        </Layout.Stack>
        <Button
            secondary
            href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/domains`}>
            View all
        </Button>
    </Layout.Stack>
    <Card padding="xs" radius="s">
        <Layout.Stack>
            {#if rules.length <= 1}
                <Layout.Stack gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">
                            Add your first custom domain
                        </Typography.Text>
                        <Typography.Caption variant="500" color="--fgcolor-neutral-tertiary">
                            Personalize your site and enhance its accessibility and branding with a
                            unique domain.
                        </Typography.Caption>
                    </Layout.Stack>
                    <div>
                        <Button
                            secondary
                            size="s"
                            on:click={() => {
                                trackEvent(Click.DomainCreateClick, {
                                    source: 'sites_domain_overview'
                                });
                            }}
                            href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/domains/add-domain`}>
                            Add domain
                        </Button>
                    </div>
                </Layout.Stack>
                {#if rules?.length}
                    <Divider />
                {/if}
            {/if}
            {#each rules?.slice(0, 3) as rule, i}
                <Layout.Stack
                    alignItems="center"
                    justifyContent="space-between"
                    direction="row"
                    gap="xl">
                    <Layout.Stack gap="xxs" inline>
                        <Link
                            variant="quiet"
                            href={`${$protocol}${rule.domain}`}
                            size="m"
                            external
                            icon>
                            <Layout.Stack gap="xs" inline direction="row" alignItems="center">
                                <Trim alternativeTrim>
                                    {rule.domain}
                                </Trim>
                            </Layout.Stack>
                        </Link>
                        <Typography.Caption variant="400" truncate>
                            Added {timeFromNow(rule.$createdAt)}
                        </Typography.Caption>
                    </Layout.Stack>
                    <Button
                        icon
                        secondary
                        size="xs"
                        on:click={() => {
                            showDomainQR = true;
                            selectedDomainURL = rule.domain;
                        }}>
                        <Icon icon={IconQrcode} />
                    </Button>
                </Layout.Stack>
                {#if i < 2 && i < rules.length - 1}
                    <Divider />
                {/if}
            {/each}
        </Layout.Stack>
    </Card>
</Layout.Stack>

{#if showDomainQR && selectedDomainURL}
    <OpenOnMobileModal bind:show={showDomainQR} {proxyRuleList} selectedUrl={selectedDomainURL} />
{/if}
