<script lang="ts">
    import { Modal } from '$lib/components';
    import { sizeToBytes } from '$lib/helpers/sizeConvertion';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import PlanExcess from '../wizard/cloudOrganizationChangeTier/planExcess.svelte';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '../changeOrganizationTierCloud.svelte';
    import { goto } from '$app/navigation';
    import { last } from '$lib/helpers/array';
    import { BillingPlan } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';

    export let show = false;
    const plan = $plansInfo?.get($organization.billingPlan);
    let usage: OrganizationUsage = null;
    let members: Models.MembershipList = null;
    let excess: Record<string, number> = null;

    onMount(async () => {
        usage = await sdk.forConsole.billing.listUsage(
            $organization.$id,
            $organization.billingCurrentInvoiceDate,
            new Date().toISOString()
        );
        members = await sdk.forConsole.teams.listMemberships($organization.$id);
        calculateExcess();
    });

    function calculateExcess() {
        const totBandwidth = usage?.bandwidth?.length > 0 ? last(usage.bandwidth).value : 0;
        const totUsers = usage?.users?.length > 0 ? last(usage.users).value : 0;

        excess = {
            bandwidth: totBandwidth > plan.bandwidth ? totBandwidth - plan.bandwidth : 0,
            storage:
                usage?.storageTotal > sizeToBytes(plan.storage, 'GB')
                    ? usage.storageTotal - sizeToBytes(plan.storage, 'GB')
                    : 0,
            users: totUsers > (plan.users || Infinity) ? totUsers - plan.users : 0,
            executions:
                usage?.executionsTotal > sizeToBytes(plan.executions, 'GB')
                    ? usage.executionsTotal - sizeToBytes(plan.executions, 'GB')
                    : 0,
            members:
                members?.total > (plan.members || Infinity)
                    ? members.total - (plan.members || Infinity)
                    : 0
        };
    }

    $: if (show) calculateExcess();
</script>

<Modal bind:show title="Limit reached">
    <p class="text">
        Usage for <b>{$organization.name}</b> organization 
        has reached the limits of the {tierToPlan($organization.billingPlan).name} plan. Excess usage fees will apply.
    </p>


    <PlanExcess {excess} currentTier={$organization.billingPlan} />

    <svelte:fragment slot="footer">
        <div class="u-flex u-main-space-between u-width-full-line">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <div class="u-flex u-main-end u-gap-16">
                <Button
                    secondary
                    on:click={() => {
                        show = false;
                        goto(`/console/organization-${$organization.$id}/usage`);
                    }}>
                    View usage
                </Button>
                <Button
                    on:click={() => {
                        show = false;
                        wizard.start(ChangeOrganizationTierCloud);
                        trackEvent('click_organization_upgrade', {
                            from: 'button',
                            source: 'limit_reached_modal'
                        });
                    }}>
                    Upgrade plan
                </Button>
            </div>
        </div>
    </svelte:fragment>
</Modal>
