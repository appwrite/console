<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import CnameTable from './cnameTable.svelte';
    import VerificationBox from './verificationBox.svelte';
    import LL from '$i18n/i18n-svelte';
    
    let isVerifying = false;
    let isVerified = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Add a CNAME record</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.consoleSettings.dnsProvider()}
    </svelte:fragment>
    <input class="u-hide" type="checkbox" name="isVerified" required bind:checked={isVerified} />
    <CnameTable />

    <div class="container u-padding-inline-0">
        <p>{$LL.console.project.texts.consoleSettings.time()}</p>

        <div class="container u-padding-inline-0">
            <VerificationBox {isVerifying} bind:isVerified />
        </div>
    </div>
</WizardStep>
