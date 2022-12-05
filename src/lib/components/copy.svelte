<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;
    export let event: string = null;

    let content = 'Click to copy';

    async function securedCopy() {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            return false;
        }

        return true;
    }

    function unsecuredCopy() {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let success = true;
        try {
            document.execCommand('copy');
        } catch {
            success = false;
        } finally {
            document.body.removeChild(textArea);
        }

        return success;
    }

    async function copy() {
        // Because of how JS works, unsecuredCopy only runs if securedCopy fails
        const success = (await securedCopy()) || unsecuredCopy();

        if (success) {
            content = 'Copied';
        } else {
            addNotification({
                message: 'Unable to copy to clipboard',
                type: 'error'
            });
        }

        if (event) {
            trackEvent('click_id_tag', {
                name: event
            });
        }
    }
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
