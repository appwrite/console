<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputChoice } from '$lib/elements/forms';
    import { FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Selector, Typography } from '@appwrite.io/pink-svelte';
    import { project } from '../../store';

    let authMembershipsUserName = $project?.authMembershipsUserName ?? true;
    let authMembershipsUserEmail = $project?.authMembershipsUserEmail ?? true;
    let authMembershipsMfa = $project?.authMembershipsMfa ?? true;

    async function updateMembershipsPrivacy() {
        try {
            await sdk.forConsole.projects.updateMembershipsPrivacy(
                $project.$id,
                authMembershipsUserName,
                authMembershipsUserEmail,
                authMembershipsMfa
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated memberships privacy'
            });
            trackEvent(Submit.AuthMembershipPrivacyUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthMembershipPrivacyUpdate);
        }
    }
</script>

<Form onSubmit={updateMembershipsPrivacy}>
    <CardGrid>
        <Heading tag="h2" size="7" id="personal-data">Memberships privacy</Heading>
        <Typography.Text>
            Set privacy preferences to manage which details team members can view about one another.
        </Typography.Text>
        <svelte:fragment slot="aside">
            <Selector.Checkbox
                id="membershipsUserName"
                label="Name"
                size="s"
                description="Display team members' names to other team members"
                bind:checked={authMembershipsUserName} />
            <Selector.Checkbox
                id="membershipsUserEmail"
                label="Email"
                size="s"
                description="Allow team members to view each other's email addresses"
                bind:checked={authMembershipsUserEmail} />
            <Selector.Checkbox
                id="membershipsMfa"
                label="MFA status"
                size="s"
                description="Show if team members have multi-factor authentication enabled"
                bind:checked={authMembershipsMfa} />
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button
                disabled={authMembershipsUserName === ($project?.authMembershipsUserName ?? true) &&
                    authMembershipsUserEmail === ($project?.authMembershipsUserEmail ?? true) &&
                    authMembershipsMfa === ($project?.authMembershipsMfa ?? true)}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
