<script lang="ts">
    import DomainsPage from '$routes/(console)/project-[region]-[project]/settings/domains/+page.svelte';
    let { data } = $props();
</script>

<DomainsPage {data} />

