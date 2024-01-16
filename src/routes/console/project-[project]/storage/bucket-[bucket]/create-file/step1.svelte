<script lang="ts">
    import { Alert, CustomId } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button, FormList, InputFile } from '$lib/elements/forms';
    import { humanFileSize, sizeToBytes } from '$lib/helpers/sizeConvertion';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { getServiceLimit, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { bucket } from '../store';
    import { createFile } from './store';

    let showCustomId = false;
    const service = getServiceLimit('fileSize');
</script>

<WizardStep>
    <svelte:fragment slot="title">Create file</svelte:fragment>
    <svelte:fragment slot="subtitle">Upload a file to add it to your bucket.</svelte:fragment>

    {#if isCloud}
        {@const size = humanFileSize(sizeToBytes(service, 'MB', 1000))}
        {@const plan = tierToPlan($organization?.billingPlan)}
        <Alert type="info">
            <p class="text">
                The {plan.name} plan has a maximum upload file size limit of {Math.floor(
                    parseInt(size.value)
                )}{size.unit}.
                {#if $organization?.billingPlan === BillingPlan.STARTER}
                    Upgrade to allow files of a larger size.
                {/if}
            </p>
            <svelte:fragment slot="action">
                {#if $organization?.billingPlan === BillingPlan.STARTER}
                    <div class="alert-buttons u-flex">
                        <Button text on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                            Upgrade plan
                        </Button>
                    </div>
                {/if}
            </svelte:fragment>
        </Alert>
    {/if}

    <FormList class="u-margin-block-start-24">
        <div class="u-width-full-line u-overflow-hidden">
            <InputFile
                required
                bind:files={$createFile.files}
                allowedFileExtensions={$bucket.allowedFileExtensions}
                maxSize={$bucket.maximumFileSize} />
        </div>

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        File ID
                    </span>
                </Pill>
            </div>
        {:else}
            <div class="custom-id-wrapper">
                <CustomId bind:show={showCustomId} name="File" bind:id={$createFile.id} />
            </div>
        {/if}
    </FormList>
</WizardStep>

<style lang="scss">
    .custom-id-wrapper :global(.is-inner-modal) {
        inline-size: auto;
    }
</style>
