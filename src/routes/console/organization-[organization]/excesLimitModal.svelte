<script lang="ts">
    import { Modal } from '$lib/components';
    import { sizeToBytes } from '$lib/helpers/sizeConvertion';
    import { plansInfo } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import PlanExcess from '../wizard/cloudOrganizationChangeTier/planExcess.svelte';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import type { Models } from '@appwrite.io/console';

    const plan = $plansInfo.plans.find((plan) => plan.$id === $organization.billingPlan);
    let usage: OrganizationUsage = null;
    let members: Models.MembershipList = null;

    onMount(async () => {
        usage = await sdk.forConsole.billing.listUsage($organization.$id);
        members = await sdk.forConsole.teams.listMemberships($organization.$id);
    });

    $: excess = {
        bandwidth: usage.bandwidth[0] > plan.bandwidth ? usage.bandwidth[0] - plan.bandwidth : 0,
        storage:
            usage.storage[0] > sizeToBytes(plan.storage, 'GB')
                ? usage.storage[0] - plan.storage
                : 0,
        users: usage.users[0] > plan.users ? usage.users[0] - plan.users : 0,
        executions:
            usage.executions[0] > plan.executions ? usage.executions[0] - plan.executions : 0,
        members: members.total > plan.members ? members.total - (plan.members || Infinity) : 0
    };
</script>

<Modal>
    <PlanExcess {excess} currentTier={$organization.billingPlan} />
</Modal>
