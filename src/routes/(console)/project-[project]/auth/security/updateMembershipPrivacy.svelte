<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { FormList } from '$lib/elements/forms';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
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
        <p>
            Set privacy preferences to manage which details team members can view about one another.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <div class="u-flex-vertical u-gap-8 body-text-2">
                    <InputCheckbox
                        bind:checked={authMembershipsUserName}
                        id="membershipsUserName"
                        label="Name" />
                    <p class="u-margin-inline-28">Display team members' usernames to to others</p>
                </div>
                <div class="u-flex-vertical u-gap-8 body-text-2">
                    <InputCheckbox
                        bind:checked={authMembershipsUserEmail}
                        id="membershipsUserEmail"
                        label="Email" />
                    <p class="u-margin-inline-28">
                        Allow team members to view each other's email addresses
                    </p>
                </div>
                <div class="u-flex-vertical u-gap-8 body-text-2">
                    <InputCheckbox
                        bind:checked={authMembershipsMfa}
                        id="membershipsMfa"
                        label="MFA status" />
                    <p class="u-margin-inline-28">
                        Show if team members have multi-factor authentication enabled
                    </p>
                </div>
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={authMembershipsUserName === ($project?.authMembershipsUserName ?? true) &&
                    authMembershipsUserEmail === ($project?.authMembershipsUserName ?? true) &&
                    authMembershipsMfa === ($project?.authMembershipsMfa ?? true)}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
