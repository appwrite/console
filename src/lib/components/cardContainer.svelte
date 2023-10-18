<script lang="ts">
    import { page } from '$app/stores';
    import { Empty } from '$lib/components';
    import { CARD_LIMIT } from '$lib/constants';
    import { getServiceLimit } from '$lib/stores/billing';
    import { preferences } from '$lib/stores/preferences';
    import { isCloud } from '$lib/system';
    import CardPlanLimit from './cardPlanLimit.svelte';

    export let offset = 0;
    export let total = 0;
    export let event: string = null;
    export let service = '';
    export let serviceId = service;

    $: planLimit = getServiceLimit(serviceId) ?? Infinity;

    $: limit = preferences.get($page.route)?.limit ?? CARD_LIMIT;
</script>

<ul
    class="grid-box common-section u-margin-block-start-32"
    style={`--grid-gap:1.5rem; --grid-item-size:${total > 3 ? '22rem' : '25rem'};`}
    data-private>
    <slot />

    {#if total > 3 ? total < limit + offset : total % 2 !== 0}
        {#if isCloud && serviceId && total >= planLimit}
            <CardPlanLimit {service} />
        {:else}
            <Empty on:click target={event}>
                <slot name="empty" />
            </Empty>
        {/if}
    {/if}
</ul>
