<script lang="ts">
    import MigrationsPage from '$routes/(console)/project-[region]-[project]/settings/migrations/+page.svelte';
    let { data } = $props();
</script>

<MigrationsPage {data} />
