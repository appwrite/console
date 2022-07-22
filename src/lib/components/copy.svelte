<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;
    let text = 'Click to copy';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            text = 'Copied';
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<span
    class="tooltip "
    on:mouseenter={() => (text = 'Click to copy')}
    on:click|preventDefault={copy}>
    <slot />
    <span class="tooltip-popup is-bottom" role="tooltip"> {text} </span>
</span>
