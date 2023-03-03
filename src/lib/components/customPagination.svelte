<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import type { Dependencies } from '$lib/constants';
    import { InputSelect } from '$lib/elements/forms';
    import { customPageLimit } from '$lib/stores/layout';
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

    async function limitChange() {
        const currentPage = Math.floor(offset / $customPageLimit + 1);
        const newPage = Math.floor((offset + 1) / limit);
        $customPageLimit = limit;

        await Promise.allSettled([
            dependencies.forEach((dependency) => {
                invalidate(dependency);
            })
        ]);
        if (currentPage !== newPage) {
            await goto(path + (newPage > 1 ? `/${newPage}` : ``), { replaceState: true });
        }
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
