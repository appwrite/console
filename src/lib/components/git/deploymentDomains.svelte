<script lang="ts">
    import { Trim } from '$lib/components';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { protocol } from '$routes/(console)/store';
    import type { Models } from '@appwrite.io/console';
    import { IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Icon, Layout, Popover, Tag, Typography } from '@appwrite.io/pink-svelte';

    let {
        domains,
        hideQRCode = true,
        showQR = () => {}
    }: {
        domains: Models.ProxyRuleList;
        hideQRCode?: boolean;
        showQR?: (show: boolean) => void;
    } = $props();

    let sortedDomains = $derived(
        domains?.rules?.sort((a, b) => {
            if (a?.trigger === 'manual' && b?.trigger !== 'manual') {
                return -1;
            } else if (a?.trigger !== 'manual' && b?.trigger === 'manual') {
                return 1;
            }
            return 0;
        })
    );
</script>

<Layout.Stack gap="xxs" direction="row" alignItems="center">
    {#if domains?.total}
        <Link external href={`${$protocol}${sortedDomains[0]?.domain}`} variant="muted">
            <Layout.Stack gap="xxs" direction="row" alignItems="center">
                <Trim alternativeTrim>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                        {sortedDomains[0]?.domain}
                    </Typography.Text>
                </Trim>
            </Layout.Stack>
        </Link>

        {#if sortedDomains.length > 1}
            <Popover padding="none" let:toggle placement="bottom-end">
                <Tag size="xs" on:click={toggle}>
                    +{sortedDomains.length - 1}
                </Tag>
                <svelte:fragment slot="tooltip">
                    <ActionMenu.Root width="20px">
                        {#each sortedDomains as rule, i}
                            {#if i !== 0}
                                <ActionMenu.Item.Anchor
                                    href={`${$protocol}${rule.domain}`}
                                    external
                                    leadingIcon={IconExternalLink}>
                                    <Trim alternativeTrim>
                                        {rule.domain}
                                    </Trim>
                                </ActionMenu.Item.Anchor>
                            {/if}
                        {/each}
                    </ActionMenu.Root>
                </svelte:fragment>
            </Popover>
        {/if}
        {#if !hideQRCode}
            <Button icon secondary size="xs" on:click={() => showQR(true)}>
                <Icon icon={IconQrcode} size="s" />
            </Button>
        {/if}
    {:else}
        <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
            No domains available
        </Typography.Text>
    {/if}
</Layout.Stack>
