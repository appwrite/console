<script lang="ts">
    import View from './view.svelte';
    export let data;
</script>

<View files={data.files} limit={data.limit} offset={data.offset} search={data.search} />
