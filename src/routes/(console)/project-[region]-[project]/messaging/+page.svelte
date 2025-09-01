<script lang="ts">
    import View from './view.svelte';
    export let data;
</script>

<View messages={data.messages} limit={data.limit} offset={data.offset} view={data.view} search={data.search} query={data.query} pageNum={data.page} />
