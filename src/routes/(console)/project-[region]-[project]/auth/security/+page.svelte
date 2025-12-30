<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdateMockNumbers from './updateMockNumbers.svelte';
    import UpdateMembershipPrivacy from './updateMembershipPrivacy.svelte';
    import UpdateUsersLimit from './updateUsersLimit.svelte';
    import UpdateSessionLength from './updateSessionLength.svelte';
    import UpdateSessionsLimit from './updateSessionsLimit.svelte';
    import PasswordPolicies from './passwordPolicies.svelte';
    import SessionSecurity from './sessionSecurity.svelte';
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
    <PasswordPolicies />
    <SessionSecurity />
    <UpdateMockNumbers />
    <UpdateMembershipPrivacy />
</Container>
