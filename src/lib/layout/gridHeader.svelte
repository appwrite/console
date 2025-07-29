<script lang="ts">
    import { ViewSelector } from '$lib/components';
    import { Typography } from '@appwrite.io/pink-svelte';
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
    <Typography.Title size="m">{title}</Typography.Title>
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
