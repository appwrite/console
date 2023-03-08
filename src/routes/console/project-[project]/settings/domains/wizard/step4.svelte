<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { domain } from './store';
    import { project } from '../../../store';
    import CnameTable from './cnameTable.svelte';
    import VerificationBox from './verificationBox.svelte';

    const projectId = $project.$id;

    let certificate = false;
    const checkCertificate = () => {
        setTimeout(async () => {
            const result = await sdkForConsole.projects.getDomain(projectId, $domain.$id);
            if (!result.certificateId) {
                checkCertificate();
                return;
            }
            certificate = true;
        }, 2000);
    };
    checkCertificate();
</script>

<WizardStep>
    <svelte:fragment slot="title">Add a CNAME record</svelte:fragment>
    <svelte:fragment slot="subtitle">
        In order to continue, set the following record on your DNS provider
    </svelte:fragment>

    <CnameTable />

    <div class="boxes-wrapper u-margin-block-start-24">
        <VerificationBox isVerifying={false} isVerified={true} />
        <div class="box">
            <div class="u-flex u-gap-16 u-cross-center">
                {#if !certificate}
                    <div
                        class="loader"
                        style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
                {:else}
                    <span
                        class="icon-check"
                        aria-hidden="true"
                        style="color: hsl(var(--color-neutral-50))" />
                {/if}
                <p class="u-stretch">
                    {!certificate ? 'Generating SSL certificate' : 'Generated SSL certificate'}
                </p>
            </div>
        </div>
    </div>
</WizardStep>
