<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import CnameTable from './cnameTable.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">Add a CNAME record</svelte:fragment>
    <svelte:fragment slot="subtitle">
        In order to continue, set the following record on your DNS provider
    </svelte:fragment>

    <CnameTable />
</WizardStep>
