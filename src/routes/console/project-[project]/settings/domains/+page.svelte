<script lang="ts">
    import type { PageData } from './$types';
    import DomainContainer from '$lib/components/domains/domainContainer.svelte';

    export let data: PageData;
</script>

<DomainContainer rules={data.rules} resourceType="api" resourceId="" />
