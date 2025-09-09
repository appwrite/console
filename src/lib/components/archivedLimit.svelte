<script lang="ts">
    import { goto } from '$app/navigation';
    import { page as pageStore } from '$app/state';
    import { InputSelect } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    import { Layout } from '@appwrite.io/pink-svelte';

    let { sum, limit, name }: { sum: number; limit: number; name: string } = $props();

    const options = [
        { label: '6', value: 6 },
        { label: '12', value: 12 },
        { label: '24', value: 24 },
        { label: '48', value: 48 },
        { label: '96', value: 96 }
    ];

    async function limitChange() {
        const url = new URL(pageStore.url);
        const previousLimit = Number(url.searchParams.get('limit'));
        url.searchParams.set('limit', limit.toString());
        preferences.setLimit(limit);

        // Handle archived page pagination
        if (url.searchParams.has('archivedPage')) {
            const page = Number(url.searchParams.get('archivedPage'));
            const newPage = Math.floor(((page - 1) * previousLimit) / limit);
            if (newPage === 1) {
                url.searchParams.delete('archivedPage');
            } else {
                url.searchParams.set('archivedPage', newPage.toString());
            }
        }

        await goto(url.toString());
    }
</script>

<Layout.Stack direction="row" alignItems="center" inline>
    <InputSelect id="archived-rows" {options} bind:value={limit} on:change={limitChange} />
    <p class="text" style:white-space="nowrap">
        {name} per page. Total: {sum >= 5000 ? `${sum}+` : sum}
    </p>
</Layout.Stack>
