<script lang="ts">
    import { invalidate } from '$app/navigation';
    import type { Dependencies } from '$lib/constants';
    import { InputSelect } from '$lib/elements/forms';
    import { prefs } from '$lib/stores/user';
    import { onMount } from 'svelte';
    import { Pagination } from '.';
    export let total: number;
    export let offset: number;
    export let limit: number;
    export let path: string;
    export let name: string = 'Items';
    export let dependencies: Dependencies[];

    const options = [
        { label: '6', value: 6 },
        { label: '12', value: 12 },
        { label: '24', value: 24 },
        { label: '48', value: 48 },
        { label: '96', value: 96 },
        { label: '192', value: 192 }
    ];

    onMount(() => {
        prefs.load();
        $prefs?.pageLimit && (limit = $prefs.pageLimit);
    });

    async function limitChange() {
        prefs.updatePrefs({ ...$prefs, pageLimit: limit });

        await Promise.allSettled([
            dependencies.forEach((dependency) => {
                invalidate(dependency);
            })
        ]);
    }
</script>

<div class="u-flex u-margin-block-start-32 u-main-space-between">
    <div class="u-flex u-gap-12 u-cross-center">
        <InputSelect
            id="rows"
            label="Rows per page"
            showLabel={false}
            bind:value={limit}
            {options}
            on:change={limitChange} />
        <p class="text">{name} per page. Total results: {total}</p>
    </div>
    <Pagination {offset} {limit} sum={total} {path} />
</div>
