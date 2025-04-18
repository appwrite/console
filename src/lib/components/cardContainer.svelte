<script lang="ts">
    import { page } from '$app/state';
    import { Empty } from '$lib/components';
    import { CARD_LIMIT } from '$lib/constants';
    import { getServiceLimit, type PlanServices } from '$lib/stores/billing';
    import { preferences } from '$lib/stores/preferences';
    import { isCloud } from '$lib/system';
    import CardPlanLimit from './cardPlanLimit.svelte';

    export let disableEmpty = true;
    export let offset = 0;
    export let total = 0;
    export let event: string = null;
    export let service = '';
    export let serviceId: PlanServices = service as PlanServices;

    $: planLimit = getServiceLimit(serviceId) || Infinity;

    $: limit = preferences.get(page.route)?.limit ?? CARD_LIMIT;
</script>

<ul class="grid-box" style={`--grid-item-size:${total > 3 ? '22rem' : '25rem'};`} data-private>
    <slot />

    {#if total > 3 ? total < limit + offset : total % 2 !== 0}
        {#if isCloud && serviceId && total >= planLimit}
            <CardPlanLimit {service} />
        {:else}
            <Empty on:click target={event} disabled={disableEmpty}>
                <slot name="empty" />
            </Empty>
        {/if}
    {/if}
</ul>

<style lang="scss">
    .grid-box {
        display: grid;
        grid-auto-rows: 1fr;
        gap: var(--gap-xl);
        flex-shrink: 0;
        grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-size), 1fr));
    }
</style>
