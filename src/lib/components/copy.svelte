<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';

    export let value: string;
    let text = 'Copy ID';

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            text = 'Copied ID';
            setTimeout(() => {
                text = 'Copy ID';
            }, 2000);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<span class="tooltip " on:mouseenter={() => (text = 'Copy ID')} on:click|preventDefault={copy}>
    <slot />
    <span class="tooltip-popup is-bottom" role="tooltip"> {text} </span>
</span>
