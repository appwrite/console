<script lang="ts">
    import View from './view.svelte';
    export let data;
</script>

<View tables={data.tables} limit={data.limit} offset={data.offset} view={data.view} search={data.search} />
