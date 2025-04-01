<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { copy } from '$lib/helpers/copy';
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;
    export let event: string = null;
    export let eventContext = 'click_id_tag';
    export let copyText: string = 'Click to copy';
    export let appendTo: Parameters<typeof tooltip>['1']['appendTo'] = undefined;

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
</script>

<span
    data-private
    role="button"
    tabindex="0"
    style:cursor="pointer"
    on:click|preventDefault={handleClick}
    on:keyup={clickOnEnter}
    on:mouseenter={() => setTimeout(() => (content = copyText))}
    use:tooltip={{
        content,
        hideOnClick: false,
        appendTo
    }}>
    <slot />
</span>
