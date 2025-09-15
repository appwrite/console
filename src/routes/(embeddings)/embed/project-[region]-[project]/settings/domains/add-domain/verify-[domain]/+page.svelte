<script lang="ts">
    import VerifyDomainPage from '$routes/(console)/project-[region]-[project]/settings/domains/add-domain/verify-[domain]/+page.svelte';
    let { data } = $props();
</script>

<VerifyDomainPage {data} />

