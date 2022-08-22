<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';

    import { addNotification } from '$lib/stores/notifications';

    export let value: string;

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
        }
    };
</script>

<div class="input-text-wrapper is-with-end-button">
    <input {value} type="text" class="input-text" readonly />
    <button
        type="button"
        class="input-button"
        aria-label="Click to copy."
        on:click={copy}
        on:mouseenter={() => setTimeout(() => (content = 'Click to copy'))}
        use:tooltip={{
            content,
            hideOnClick: false
        }}>
        <span class="icon-duplicate" aria-hidden="true" />
    </button>
</div>
