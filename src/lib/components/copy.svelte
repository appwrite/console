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

<span
    on:click|preventDefault={copy}
    on:mouseenter={() => setTimeout(() => (content = 'Click to copy'))}
    use:tooltip={{
        content,
        hideOnClick: false
    }}>
    <slot />
</span>
