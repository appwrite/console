<script lang="ts">
    import { Trim } from '$lib/components';
    import { Link, Pill } from '$lib/elements';
    import { consoleVariables } from '$routes/(console)/store';
    import type { Models } from '@appwrite.io/console';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Icon, Layout, Popover } from '@appwrite.io/pink-svelte';

    export let domains: Models.ProxyRuleList;

    let protocol: 'http://' | 'https://' = $consoleVariables?._APP_OPTIONS_FORCE_HTTPS
        ? 'https://'
        : 'http://';
</script>

<Layout.Stack gap="xxs" direction="row" alignItems="center">
    <Link external href={`${protocol}${domains.rules[0].domain}`}>
        <Layout.Stack gap="xxs" direction="row" alignItems="center">
            <Trim alternativeTrim>
                {domains.rules[0].domain}
            </Trim>
            <Icon icon={IconExternalLink} size="s" />
        </Layout.Stack>
    </Link>
    {#if domains.rules.length > 1}
        <Popover let:toggle>
            <Pill button on:click={toggle}>
                +{domains.rules.length - 1}
            </Pill>
            <svelte:fragment slot="popover">
                <ActionMenu.Root>
                    {#each domains.rules as rule, i}
                        {#if i !== 0}
                            <ActionMenu.Item.Anchor
                                href={`${protocol}${rule.domain}`}
                                external
                                leadingIcon={IconExternalLink}>
                                {rule.domain}
                            </ActionMenu.Item.Anchor>
                        {/if}
                    {/each}
                </ActionMenu.Root>
            </svelte:fragment>
        </Popover>
    {/if}
</Layout.Stack>
