<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import CnameTable from './cnameTable.svelte';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">Add a CNAME record</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.consoleSettings.dnsProvider()}
    </svelte:fragment>

    <CnameTable />
</WizardStep>
