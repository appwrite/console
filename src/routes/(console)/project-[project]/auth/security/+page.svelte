<script lang="ts">
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import { Container } from '$lib/layout';
    import { isCloud } from '$lib/system';
    import UpdateMockNumbers from './updateMockNumbers.svelte';
    import UpdatePasswordDictionary from './updatePasswordDictionary.svelte';
    import UpdatePasswordHistory from './updatePasswordHistory.svelte';
    import UpdatePersonalDataCheck from './updatePersonalDataCheck.svelte';
    import UpdateSessionAlerts from './updateSessionAlerts.svelte';
    import UpdateSessionLength from './updateSessionLength.svelte';
    import UpdateSessionsLimit from './updateSessionsLimit.svelte';
    import UpdateMembershipPrivacy from './updateMembershipPrivacy.svelte';
    import UpdateUsersLimit from './updateUsersLimit.svelte';
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
    <UpdatePasswordHistory />
    <UpdatePasswordDictionary />
    <UpdatePersonalDataCheck />
    <UpdateSessionAlerts />
    <UpdateMockNumbers />
    {#if isCloud && $organization.billingPlan === BillingPlan.SCALE}
        <UpdateMembershipPrivacy />
    {/if}
</Container>
