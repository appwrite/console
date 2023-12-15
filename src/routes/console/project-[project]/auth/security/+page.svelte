<script lang="ts">
    import { Container } from '$lib/layout';
    import { isCloud } from '$lib/system';
    import UpdatePasswordDictionary from './updatePasswordDictionary.svelte';
    import UpdatePasswordHistory from './updatePasswordHistory.svelte';
    import UpdatePersonalDataCheck from './updatePersonalDataCheck.svelte';
    import UpdatePwned from './updatePwned.svelte';
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
    <UpdatePersonalDataCheck />
    {#if isCloud}
        <UpdatePwned />
    {/if}
</Container>
