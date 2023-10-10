<script lang="ts">
    import { getServiceLimit } from '$lib/stores/billing';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { Button } from '../forms';

    let tableBody: HTMLDivElement;

    export let service: string = null;
    export let name = service;
    export let total: number = null;

    let columns = 0;

    $: limitReached = total >= (getServiceLimit(service) ?? Infinity);

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
                <span class="text">Upgrade your plan to add {name} to your organization</span>
                <Button secondary on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                    Change plan
                </Button>
            </span>
        </td>
    </tr>
{/if}
