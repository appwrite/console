<script lang="ts">
    import { Copy } from '.';
    import { sdk } from '$lib/stores/sdk';
    import { Flag } from '@appwrite.io/console';
    import { truncateText } from '$lib/components/id.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { getProjectEndpoint } from '$lib/helpers/project';
    import { projectRegion } from '$routes/(console)/project-[region]-[project]/store';

    $: flagSrc =
        $projectRegion && isValueOfStringEnum(Flag, $projectRegion.flag)
            ? sdk.forConsole.avatars.getFlag($projectRegion.flag, 30, 20, 100)
            : '';
</script>

<Copy value={getProjectEndpoint()} appendTo="parent" copyText="Copy endpoint">
    <div
        class="flex u-gap-8 u-cross-center interactive-text-output is-buttons-on-top u-text-center"
        style:min-inline-size="0"
        style:display="inline-flex">
        <span
            style:white-space="nowrap"
            class="text u-line-height-1-5"
            style:overflow="hidden"
            style:word-break="break-all"
            use:truncateText
            style:font-family="unset">
            {$projectRegion?.name}
        </span>

        {#if flagSrc}
            <img
                style="border-radius: 2.5px"
                src={flagSrc}
                alt={$projectRegion?.name}
                width={16}
                height={12} />
        {/if}
    </div>
</Copy>
