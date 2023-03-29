<script lang="ts">
    import { Empty } from '$lib/components';
    import { CARD_LIMIT } from '$lib/constants';
    import { prefs } from '$lib/stores/user';
    import { onMount } from 'svelte';

    export let offset = 0;
    export let total = 0;
    export let event: string = null;

    let limit = CARD_LIMIT;

    onMount(async () => {
        await prefs.load();
        $prefs?.pageLimit && (limit = $prefs.pageLimit);
    });

    prefs.subscribe((prefs) => {
        prefs?.pageLimit && (limit = prefs.pageLimit);
    });
</script>

<ul
    class="grid-box common-section u-margin-block-start-32"
    style={`--grid-gap:1.5rem; --grid-item-size:${total > 3 ? '22rem' : '25rem'};`}
    data-private>
    <slot />

    {#if total > 3 ? total < limit + offset : total % 2 !== 0}
        <Empty on:click target={event}>
            <slot name="empty" />
        </Empty>
    {/if}
</ul>
