<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    export let showCreateTeam = writable(false);
</script>

<script lang="ts">
    import View from './view.svelte';
    export let data;
</script>

<View
    teams={{ total: data.teams.total, teams: data.teams.teams }}
    limit={data.limit}
    offset={data.offset}
    pageNum={data.page}
    search={data.search}
/>
