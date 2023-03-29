<script lang="ts">
    import type { OrderData } from '$lib/helpers/load';
    import { setContext } from 'svelte';
    import { derived, writable } from 'svelte/store';
    import type { Readable } from 'svelte/store';

    export let order: OrderData = null;

    const store = writable(order);

    setContext<Readable<OrderData>>(
        'order',
        derived(store, ($store) => $store)
    );

    $: store.set(order);
</script>

<div class="table-thead" role="rowheader">
    <div class="table-row" role="row">
        <slot />
    </div>
</div>
