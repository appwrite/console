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
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
    <UpdatePasswordHistory />
    <UpdatePasswordDictionary />
    <UpdatePersonalDataCheck />
    {#if isCloud}
        <UpdatePwned compromisedUsersCount={data.compromisedUsersCount} />
    {/if}
</Container>
