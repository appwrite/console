<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;

    const copy = async () => {
        try {
            if (navigator.clipboard === undefined) {
                fallbackCopyTextToClipboard(value);
                addNotification({
                    message: 'Copied to clipboard.',
                    type: 'success'
                });
                return;
            }
            await navigator.clipboard.writeText(value);
            addNotification({
                message: 'Copied to clipboard.',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };

    function fallbackCopyTextToClipboard(text) {
        let textArea = document.createElement('textarea');
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }
</script>

<div class="input-text-wrapper is-with-end-button">
    <input {value} type="text" class="input-text" disabled />
    <button type="button" class="input-button" aria-label="Click to copy." on:click={copy}>
        <span class="icon-docs" aria-hidden="true" />
    </button>
</div>
