<script lang="ts">
    import { Copy } from '.';
    import { sdk } from '$lib/stores/sdk';
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Flag, type Models } from '@appwrite.io/console';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { getProjectEndpoint } from '$lib/helpers/project';

    export let region: Models.ConsoleRegion;

    $: flagSrc =
        region && isValueOfStringEnum(Flag, region.flag)
            ? sdk.forConsole.avatars.getFlag({
                  code: region.flag,
                  width: 30,
                  height: 20,
                  quality: 100
              })
            : '';
</script>

{#if region}
    <Copy value={getProjectEndpoint()} copyText={`Copy endpoint (${region?.name})`}>
        <Tag size="xs" variant="code">
            <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                <Icon icon={IconDuplicate} size="s" slot="start" />
                <span class="endpoint-label">API endpoint</span>

                {#if flagSrc}
                    <img
                        width={16}
                        height={12}
                        src={flagSrc}
                        alt={region?.name}
                        class="region-flag"
                        style:border-radius="2.5px" />
                {/if}

                <span
                    style:white-space="nowrap"
                    class="text u-line-height-1-5"
                    style:overflow="hidden"
                    style:word-break="break-all"
                    use:truncateText={region?.name}
                    style:font-family="unset">
                    {region?.name}
                </span>
            </Layout.Stack>
        </Tag>
    </Copy>
{/if}

<style>
    .endpoint-label {
        white-space: nowrap;
        overflow: hidden;
        word-break: break-all;
    }

    .region-flag {
        width: 16px;
        height: 12px;
        border-radius: 2.5px;
        margin-inline-start: 6px;
    }
</style>
