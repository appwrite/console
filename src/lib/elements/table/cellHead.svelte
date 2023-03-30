<script lang="ts">
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import type { Column } from '$lib/components/viewSelector.svelte';
    import { Order, QueryParams, type OrderData } from '$lib/helpers/load';
    import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';

    export let width: number = null;
    export let onlyDesktop = false;
    export let eyebrow = true;
    export let column: Column = null;

    const order = getContext<Readable<OrderData>>('order');

    function createLink(url: URL): string {
        const target = new URL(url);
        const attribute = target.searchParams.get(QueryParams.OrderAttribute);
        const sameColumn = attribute === column.id;
        const current = sameColumn ? target.searchParams.get(QueryParams.OrderDirection) : null;

        switch (current) {
            case Order.DESC:
                if (attribute === column.id) {
                    target.searchParams.delete(QueryParams.OrderAttribute);
                    target.searchParams.delete(QueryParams.OrderDirection);
                    return target.toString();
                } else {
                    target.searchParams.set(QueryParams.OrderDirection, Order.ASC);
                }
                break;
            case Order.ASC:
                target.searchParams.set(QueryParams.OrderDirection, Order.DESC);
                break;

            default:
                target.searchParams.set(QueryParams.OrderDirection, Order.ASC);
                break;
        }
        target.searchParams.set(QueryParams.OrderAttribute, column.id);

        return target.toString();
    }

    $: link = column && createLink($page.url);
</script>

<div
    style={width ? `--p-col-width:${width?.toString()}` : ''}
    class:is-only-desktop={onlyDesktop}
    class="table-thead-col"
    role="columnheader">
    <span class:eyebrow-heading-3={eyebrow} class:body-text-2={!eyebrow}>
        <slot />
        {#if column && $order}
            {@const same = $order.attribute === column.id}
            <a
                data-sveltekit-keepfocus
                href={link}
                class:u-color-text-disabled={!same}
                style:display="inline-grid"
                style:line-height="0.5"
                style:vertical-align="middle"
                style:min-block-size="1.125rem"
                style:place-content="center"
                use:tooltip={{
                    content: same
                        ? $order.direction === Order.ASC
                            ? 'Sort descending'
                            : 'Remove order'
                        : 'Sort ascending',
                    placement: 'bottom'
                }}>
                {#if same}
                    {#if $order.direction === Order.ASC}
                        <span
                            class="icon-cheveron-up"
                            style:font-size="var(--icon-size-small)"
                            aria-hidden="true" />
                    {:else}
                        <span
                            class="icon-cheveron-down"
                            style:font-size="var(--icon-size-small)"
                            aria-hidden="true" />
                    {/if}
                {:else}
                    <span
                        class="icon-cheveron-up"
                        style:font-size="var(--icon-size-small)"
                        aria-hidden="true" />
                    <span
                        class="icon-cheveron-down"
                        style:font-size="var(--icon-size-small)"
                        aria-hidden="true" />
                {/if}
            </a>
        {/if}
    </span>
</div>
