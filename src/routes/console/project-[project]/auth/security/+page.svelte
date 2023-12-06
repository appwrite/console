<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdatePasswordAi from './updatePasswordAi.svelte';
    import UpdatePasswordDictionary from './updatePasswordDictionary.svelte';
    import UpdatePasswordHistory from './updatePasswordHistory.svelte';
    import UpdatePersonalDataCheck from './updatePersonalDataCheck.svelte';
    import UpdateSessionLength from './updateSessionLength.svelte';
    import UpdateSessionsLimit from './updateSessionsLimit.svelte';
    import UpdateUsersLimit from './updateUsersLimit.svelte';
    import UpdateNotify from './updateNotify.svelte';
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
    <UpdatePasswordHistory />
    <UpdatePasswordDictionary />
    <UpdatePersonalDataCheck />
    <UpdatePasswordAi />
    <UpdateNotify />
</Container>
