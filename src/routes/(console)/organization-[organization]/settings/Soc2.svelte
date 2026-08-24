<script lang="ts">
    import { Box, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import Soc2Modal from './Soc2Modal.svelte';
    import { getBasePlanFromGroup, getChangePlanUrl, planSupportsSoc2 } from '$lib/stores/billing';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';

    let {
        locale,
        countryList
    }: {
        locale: Models.Locale;
        countryList: Models.CountryList;
    } = $props();

    let show = $state(false);

    const supportsSoc2 = $derived(planSupportsSoc2($currentPlan));
    const upgradePlanName = $derived(getBasePlanFromGroup(BillingPlanGroup.Scale)?.name);
</script>

<CardGrid>
    <svelte:fragment slot="title">SOC-2</svelte:fragment>
    After requesting SOC-2, we will contact you via email for the next steps.
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Service Organization Control Type 2 (SOC-2)</b>
            </h6>
            <p class="text u-margin-block-start-8">
                SOC-2 is a framework for managing and protecting sensitive information, ensuring
                compliance with trust service criteria such as security, availability, processing
                integrity, confidentiality, and privacy.
            </p>
            {#if supportsSoc2}
                <Button
                    secondary
                    external
                    class="u-margin-block-start-16"
                    on:click={() => (show = true)}
                    event="request_soc-2">
                    <span class="text">Request SOC-2</span>
                </Button>
            {:else}
                <p class="text u-margin-block-start-8">
                    SOC-2 is not available on your current plan.{upgradePlanName
                        ? ` Upgrade to ${upgradePlanName} to request a SOC-2 report for your organization.`
                        : ''}
                </p>
                {#if upgradePlanName}
                    <Button
                        secondary
                        class="u-margin-block-start-16"
                        href={getChangePlanUrl($organization?.$id)}>
                        <span class="text">Upgrade plan</span>
                    </Button>
                {/if}
            {/if}
        </Box>
    </svelte:fragment>
</CardGrid>

{#if supportsSoc2}
    <Soc2Modal {locale} {countryList} bind:show />
{/if}
