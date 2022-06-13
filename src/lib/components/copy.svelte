<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;

    const copy = async () => {
        try {
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
</script>

<div class="input-text-wrapper is-with-end-button">
    <input {value} type="text" class="input-text" disabled />
    <button type="button" class="input-button" aria-label="Click to copy." on:click={copy}>
        <span class="icon-duplicate" aria-hidden="true" />
    </button>
</div>
