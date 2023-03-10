<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import CnameTable from './cnameTable.svelte';
    import VerificationBox from './verificationBox.svelte';
    import { rule } from './store';

    let isVerified = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Add a CNAME record</svelte:fragment>
    <svelte:fragment slot="subtitle">
        In order to continue, set the following record on your DNS provider
    </svelte:fragment>
    <input class="u-hide" type="checkbox" name="isVerified" required bind:checked={isVerified} />
    <CnameTable />

    <div class="container u-padding-inline-0">
        <p>Changes may take some time to take effect depending on your provider.</p>

        <div class="container u-padding-inline-0">
            <VerificationBox bind:isVerified />
        </div>
    </div>
</WizardStep>
