<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { copy } from '$lib/helpers/copy';
    import { addNotification } from '$lib/stores/notifications';
    import { Tooltip } from '@appwrite.io/pink-svelte';

    export let value: string;
    export let event: string = null;
    export let eventContext = 'click_id_tag';
    export let tooltipDisabled = false;
    export let copyText: string = 'Click to copy';

    let content = copyText;

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

<Tooltip disabled={tooltipDisabled}>
    <span
        data-private
        style:display="inline-flex"
        role="button"
        tabindex="0"
        style:cursor="pointer"
        on:click|preventDefault|stopPropagation={handleClick}
        on:keyup={clickOnEnter}
        on:mouseenter={() => setTimeout(() => (content = 'Click to copy'))}>
        <slot />
    </span>
    <p slot="tooltip">{content}</p>
</Tooltip>
