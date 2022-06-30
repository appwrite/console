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

<span on:click={copy}>
    <slot />
</span>
