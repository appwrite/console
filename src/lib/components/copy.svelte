<script lang="ts">
    import type { Snippet } from 'svelte';
    import { copy } from '$lib/helpers/copy';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';

    let {
        value,
        event = null,
        eventContext = 'click_id_tag',
        tooltipDisabled = false,
        tooltipPortal = false,
        copyText = 'Click to copy',
        delay = 0,
        children
    }: {
        value: string;
        event?: string;
        eventContext?: string;
        tooltipDisabled?: boolean;
        tooltipPortal?: boolean;
        copyText?: string;
        delay?: number;
        children?: Snippet;
    } = $props();

    let content = $state(copyText);

    async function handleClick() {
        const success = await copy(value);

        if (success) {
            content = 'Copied';
        } else {
            addNotification({
                message: 'Unable to copy to clipboard',
                type: 'error'
            });
        }

        if (event) {
            trackEvent(eventContext, {
                name: event
            });
        }
    }
    //TODO: remove this component
</script>

<Tooltip disabled={tooltipDisabled} portal={tooltipPortal} {delay}>
    <span
        data-private
        style:display="inline-flex"
        role="button"
        tabindex="0"
        style:cursor="pointer"
        onclick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleClick();
        }}
        onkeyup={clickOnEnter}
        onmouseenter={() => setTimeout(() => (content = copyText))}>
        {@render children?.()}
    </span>
    <p slot="tooltip" let:showing>
        {#if showing}
            {content}
        {/if}
    </p>
</Tooltip>
