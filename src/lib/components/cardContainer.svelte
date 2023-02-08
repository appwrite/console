<script lang="ts">
    import { Empty } from '$lib/components';
    import { cardLimit } from '$lib/stores/layout';

    export let offset = 0;
    export let limit = $cardLimit;
    export let total = 0;
    export let event: string = null;
</script>

<ul
    class="grid-box common-section u-margin-block-start-32"
    style={`--grid-gap:1.5rem; --grid-item-size:${total > 3 ? '22rem' : '25rem'};`}>
    <slot />

    {#if total > 3 ? total < limit + offset : total % 2 !== 0}
        <Empty on:click target={event}>
            <slot name="empty" />
        </Empty>
    {/if}
</ul>
