<script lang="ts">
    import { Copy } from '.';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Tag } from '@appwrite.io/pink-svelte';
    import { Flag, type Models } from '@appwrite.io/console';
    import { truncateText } from '$lib/components/id.svelte';
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
    <Copy value={getProjectEndpoint()} copyText="Copy endpoint">
        <Tag size="xs" variant="default">
            <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                {#if flagSrc}
                    <img
                        width={16}
                        height={12}
                        src={flagSrc}
                        alt={region?.name}
                        style:border-radius="2.5px" />
                {/if}

                <span
                    style:white-space="nowrap"
                    class="text u-line-height-1-5"
                    style:overflow="hidden"
                    style:word-break="break-all"
                    use:truncateText
                    style:font-family="unset">
                    {region?.name}
                </span>
            </Layout.Stack>
        </Tag>
    </Copy>
{/if}
