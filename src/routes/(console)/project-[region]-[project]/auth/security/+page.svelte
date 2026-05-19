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
    import UpdateSignupEmailSecurity from './updateSignupEmailSecurity.svelte';

    let { data }: PageProps = $props();
</script>

<Container>
    <UpdateUsersLimit project={data.project} policy={data.userLimitPolicy} />
    <UpdateSessionLength project={data.project} policy={data.sessionDurationPolicy} />
    <UpdateSessionsLimit project={data.project} policy={data.sessionLimitPolicy} />
    <PasswordPolicies
        project={data.project}
        dictionaryPolicy={data.passwordDictionaryPolicy}
        historyPolicy={data.passwordHistoryPolicy}
        personalDataPolicy={data.passwordPersonalDataPolicy} />
    <UpdateSignupEmailSecurity
        project={data.project}
        denyAliasedEmailPolicy={data.denyAliasedEmailPolicy}
        denyDisposableEmailPolicy={data.denyDisposableEmailPolicy}
        denyFreeEmailPolicy={data.denyFreeEmailPolicy} />
    <SessionSecurity
        project={data.project}
        sessionAlertPolicy={data.sessionAlertPolicy}
        sessionInvalidationPolicy={data.sessionInvalidationPolicy} />
    <UpdateMockNumbers project={data.project} />
    <UpdateMembershipPrivacy project={data.project} policy={data.membershipPrivacyPolicy} />
</Container>
