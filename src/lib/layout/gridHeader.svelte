<script lang="ts">
    import { Heading, ViewSelector } from '$lib/components';
    import type { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';

    export let title: string;
    export let columns: Writable<Column[]>;
    export let view: View;
    export let isCustomCollection = false;
    export let hideView = false;
    export let hideColumns = false;
    export let allowNoColumns = false;
</script>

<header class="grid-header">
    <Heading tag="h2" size="5">{title}</Heading>
    <div class="u-flex u-gap-16 u-contents-mobile">
        <ViewSelector
            {view}
            {columns}
            {isCustomCollection}
            {hideView}
            {hideColumns}
            {allowNoColumns} />
        <div class="grid-header-col-2">
            <slot />
        </div>
    </div>
</header>
