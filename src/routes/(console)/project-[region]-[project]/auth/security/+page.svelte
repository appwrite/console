<script lang="ts">
    import { Container } from '$lib/layout';
    import type { PageProps } from './$types';
    import UpdateMockNumbers from './updateMockNumbers.svelte';
    import UpdateMembershipPrivacy from './updateMembershipPrivacy.svelte';
    import UpdateUsersLimit from './updateUsersLimit.svelte';
    import UpdateSessionLength from './updateSessionLength.svelte';
    import UpdateSessionsLimit from './updateSessionsLimit.svelte';
    import PasswordPolicies from './passwordPolicies.svelte';
    import SessionSecurity from './sessionSecurity.svelte';

    let { data }: PageProps = $props();
</script>

<Container>
    <UpdateUsersLimit project={data.project} />
    <UpdateSessionLength project={data.project} />
    <UpdateSessionsLimit project={data.project} />
    <PasswordPolicies project={data.project} />
    <SessionSecurity project={data.project} />
    <UpdateMockNumbers project={data.project} />
    <UpdateMembershipPrivacy project={data.project} />
</Container>
