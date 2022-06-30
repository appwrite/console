<script>
    import { Card } from './';

    let actions = {
        textContent: 'actions'
    };
</script>

<Card>
    <div class="common-section grid-1-2">
        <div class="grid-1-2-col-1">
            <slot />
        </div>
        <div class="grid-1-2-col-2">
            <slot name="aside" />
        </div>
    </div>
    {#if actions?.textContent}
        <div class="common-section card-separator u-flex u-main-end" bind:this={actions}>
            <slot name="actions" />
        </div>
    {/if}
</Card>
