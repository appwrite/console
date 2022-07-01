<script>
    import { Card } from '$lib/components';
    export let show = false;
</script>

{#if show}
    <Card>
        <header class="modal-header">
            <h4 class="modal-title"><slot name="header" /></h4>
            <button
                type="button"
                class="x-button"
                aria-label="Close"
                title="Close"
                on:click={() => (show = false)}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        <div class="modal-content">
            <slot />
        </div>
        <div class="modal-footer">
            <slot name="footer" />
        </div>
    </Card>
{/if}
