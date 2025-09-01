<script lang="ts" context="module">
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import View from './view.svelte';
    import { writable } from 'svelte/store';
    export let data;
</script>

<View
    buckets={data.buckets}
    limit={data.limit}
    offset={data.offset}
    view={data.view}
    search={data.search}
/>
