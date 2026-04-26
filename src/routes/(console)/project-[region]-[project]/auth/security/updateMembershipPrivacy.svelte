<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Selector } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    const {
        project
    }: {
        project: Models.Project;
    } = $props();

    let authMembershipsMfa = $state(project?.authMembershipsMfa ?? true);
    let authMembershipsUserId = $state(project?.authMembershipsUserId ?? true);
    let authMembershipsUserName = $state(project?.authMembershipsUserName ?? true);
    let authMembershipsUserEmail = $state(project?.authMembershipsUserEmail ?? true);
    let authMembershipsUserPhone = $state(project?.authMembershipsUserPhone ?? true);

    const isSubmitDisabled = $derived(
        authMembershipsUserId === (project?.authMembershipsUserId ?? true) &&
            authMembershipsUserName === (project?.authMembershipsUserName ?? true) &&
            authMembershipsUserEmail === (project?.authMembershipsUserEmail ?? true) &&
            authMembershipsUserPhone === (project?.authMembershipsUserPhone ?? true) &&
            authMembershipsMfa === (project?.authMembershipsMfa ?? true)
    );

    async function updateMembershipsPrivacy() {
        try {
            await sdk
                .forProject(project.region, project.$id)
                .project.updateMembershipPrivacyPolicy({
                    userId: authMembershipsUserId,
                    userName: authMembershipsUserName,
                    userEmail: authMembershipsUserEmail,
                    userPhone: authMembershipsUserPhone,
                    userMFA: authMembershipsMfa
                });
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
        <svelte:fragment slot="title">Memberships privacy</svelte:fragment>
        Set privacy preferences to manage which details team members can view about one another.
        <svelte:fragment slot="aside">
            <Selector.Checkbox
                id="membershipsUserId"
                label="User ID"
                description="Display team members' user IDs to other team members"
                bind:checked={authMembershipsUserId} />
            <Selector.Checkbox
                id="membershipsUserName"
                label="Name"
                description="Display team members' names to other team members"
                bind:checked={authMembershipsUserName} />
            <Selector.Checkbox
                id="membershipsUserEmail"
                label="Email"
                description="Allow team members to view each other's email addresses"
                bind:checked={authMembershipsUserEmail} />
            <Selector.Checkbox
                id="membershipsUserPhone"
                label="Phone"
                description="Allow team members to view each other's phone numbers"
                bind:checked={authMembershipsUserPhone} />
            <Selector.Checkbox
                id="membershipsMfa"
                label="MFA status"
                description="Show if team members have multi-factor authentication enabled"
                bind:checked={authMembershipsMfa} />
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button disabled={isSubmitDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
