<script lang="ts">
    import { goto } from '$app/navigation';
    import { page as pageStore } from '$app/stores';
    import { InputSelect } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    export let sum: number;
    export let limit: number;
    export let name: string;

    const options = [
        { label: '6', value: 6 },
        { label: '12', value: 12 },
        { label: '24', value: 24 },
        { label: '48', value: 48 },
        { label: '96', value: 96 }
    ];

    async function limitChange() {
        const url = new URL($pageStore.url);
        url.searchParams.set('limit', limit.toString());
        preferences.setLimit(limit);
        await goto(url.toString());
    }
</script>

<div class="u-flex u-gap-12 u-cross-center">
    <InputSelect
        id="rows"
        label="Rows per page"
        showLabel={false}
        {options}
        bind:value={limit}
        on:change={limitChange} />
    <p class="text">{name} per page. Total results: {sum}</p>
</div>
