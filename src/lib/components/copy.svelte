<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;
    export let event: string | null = null;

    let content = 'Click to copy';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            content = 'Copied';
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        } finally {
            if (event) {
                trackEvent('click_id_tag', {
                    name: event
                });
            }
        }
    };
</script>

<span
    on:click|preventDefault={copy}
    on:keyup={clickOnEnter}
    on:mouseenter={() => setTimeout(() => (content = 'Click to copy'))}
    use:tooltip={{
        content,
        hideOnClick: false
    }}>
    <slot />
</span>
