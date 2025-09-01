<script lang="ts" context="module">
    export let showCreateUser = writable(false);
</script>

<script lang="ts">
    import { writable } from 'svelte/store';
    import View from './view.svelte';

    export let data;
</script>

<View
    users={{ total: data.users.total, users: data.users.users }}
    limit={data.limit}
    offset={data.offset}
    pageNum={data.page}
    search={data.search}
/>
