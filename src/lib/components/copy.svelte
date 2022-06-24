<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;

    let showTooltip = 'none';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            showTooltip = 'block';
            setTimeout(() => {
                showTooltip = 'none';
            }, 1000);
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
    <button type="button" class="input-button tooltip" aria-label="Click to copy." on:click={copy}>
        <span class="icon-duplicate" aria-hidden="true" />
        <div class="tootip">
            <span class="tooltip-popup" style={`display: ${showTooltip}`} role="tooltip">
                Copied
            </span>
        </div>
    </button>
</div>
