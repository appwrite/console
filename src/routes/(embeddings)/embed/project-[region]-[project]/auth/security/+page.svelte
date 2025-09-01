<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdatePasswordDictionary from '$routes/(console)/project-[region]-[project]/auth/security/updatePasswordDictionary.svelte';
    import UpdatePasswordHistory from '$routes/(console)/project-[region]-[project]/auth/security/updatePasswordHistory.svelte';
    import UpdatePersonalDataCheck from '$routes/(console)/project-[region]-[project]/auth/security/updatePersonalDataCheck.svelte';
    import UpdateSessionAlerts from '$routes/(console)/project-[region]-[project]/auth/security/updateSessionAlerts.svelte';
    import UpdateSessionLength from '$routes/(console)/project-[region]-[project]/auth/security/updateSessionLength.svelte';
    import UpdateSessionsLimit from '$routes/(console)/project-[region]-[project]/auth/security/updateSessionsLimit.svelte';
    import UpdateMembershipPrivacy from '$routes/(console)/project-[region]-[project]/auth/security/updateMembershipPrivacy.svelte';
    import UpdateUsersLimit from '$routes/(console)/project-[region]-[project]/auth/security/updateUsersLimit.svelte';
    import UpdateSessionInvalidation from '$routes/(console)/project-[region]-[project]/auth/security/updateSessionInvalidation.svelte';
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
    <UpdatePasswordHistory />
    <UpdatePasswordDictionary />
    <UpdatePersonalDataCheck />
    <UpdateSessionAlerts />
    <UpdateSessionInvalidation />
    <UpdateMembershipPrivacy />
</Container>

