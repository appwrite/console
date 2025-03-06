<script lang="ts">
    import { goto } from '$app/navigation';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { getServiceLimit, upgradeURL, type PlanServices } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { Button } from '../forms';

    let tableBody: HTMLDivElement;

    export let service: PlanServices = null;
    export let name = service;
    export let total: number = null;
    export let event: string = null;

    let columns = 0;

    const limit = getServiceLimit(service) || Infinity;

    // TODO: refactor this to be a string
    const upgradeMethod = () => {
        goto($upgradeURL);
    };

    $: limitReached = limit !== 0 && limit < Infinity && total >= limit;

    $: if (tableBody) {
        columns = tableBody?.parentNode?.querySelectorAll('.table-thead-col')?.length;
    }
</script>

<div class="table-tbody" role="rowgroup" bind:this={tableBody}>
    <slot />
</div>
{#if isCloud && limitReached && service}
    <tr class="table-row">
        <td class="table-col" width="100%" colspan={columns}>
            <span class="u-flex u-gap-24 u-main-center u-cross-center">
                <slot name="limit" {upgradeMethod} {limit}>
                    <span class="text">Upgrade your plan to add {name} to your organization</span>
                    <Button
                        secondary
                        href={$upgradeURL}
                        on:click={() =>
                            trackEvent(Click.OrganizationClickUpgrade, {
                                from: 'button',
                                source: event ?? 'table_row_limit_reached'
                            })}>Upgrade plan</Button>
                </slot>
            </span>
        </td>
    </tr>
{/if}
