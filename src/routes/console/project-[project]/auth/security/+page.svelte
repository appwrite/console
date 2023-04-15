<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdatePasswordDictionary from './updatePasswordDictionary.svelte';
    import UpdatePasswordHistory from './updatePasswordHistory.svelte';
    import UpdatePasswordPersonalData from './updatePasswordPersonalData.svelte';
    import UpdateSessionLength from './updateSessionLength.svelte';
    import UpdateSessionsLimit from './updateSessionsLimit.svelte';
    import UpdateUsersLimit from './updateUsersLimit.svelte';
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
    <UpdatePasswordHistory />
    <UpdatePasswordDictionary />
    <UpdatePasswordPersonalData />
</Container>
