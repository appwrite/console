<script lang="ts">
    import { isCloud } from '$lib/system';
    import { Button } from '../forms';

    export let limitReached = true;
    export let name: string = null;
</script>

<div class="table-tbody" role="rowgroup">
    <slot />
</div>
{#if isCloud && limitReached && name}
    <tr class="table-row">
        <td class="table-col" width="100%">
            <span class="u-flex u-gap-24 u-main-center u-cross-center">
                <span class="text">Upgrade your plan to add {name} to your organization</span>
                <Button secondary on:click={() => console.log('test')}>Change plan</Button>
            </span>
        </td>
    </tr>
{/if}
