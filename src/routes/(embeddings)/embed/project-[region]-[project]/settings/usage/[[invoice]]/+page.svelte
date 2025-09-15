<script lang="ts">
    import UsagePage from '$routes/(console)/project-[region]-[project]/settings/usage/[[invoice]]/+page.svelte';
    let { data } = $props();
</script>

<UsagePage {data} />

