<script lang="ts">
    import AddDomainPage from '$routes/(console)/project-[region]-[project]/settings/domains/add-domain/+page.svelte';
    let { data } = $props();
</script>

<AddDomainPage {data} />

