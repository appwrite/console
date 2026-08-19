<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteProjects } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Selector } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    const {
        project,
        policy
    }: {
        project: Models.Project;
        policy: Models.PolicyMfaFactors;
    } = $props();

    let totp = $state(policy.totp);
    let email = $state(policy.email);
    let phone = $state(policy.phone);
    let custom = $state(policy.custom);

    const isSubmitDisabled = $derived(
        totp === policy.totp &&
            email === policy.email &&
            phone === policy.phone &&
            custom === policy.custom
    );

    async function updateMfaFactors() {
        try {
            await sdk.forProject(project.region, project.$id).project.updateMFAFactorsPolicy({
                totp,
                email,
                phone,
                custom
            });
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated MFA factors'
            });
            trackEvent(Submit.AuthMfaFactorsUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthMfaFactorsUpdate);
        }
    }
</script>

<Form onSubmit={updateMfaFactors}>
    <CardGrid>
        <svelte:fragment slot="title">MFA factors</svelte:fragment>
        Choose which factors your users can use to complete a multi-factor authentication challenge. Recovery
        codes always remain available as a fallback.
        <svelte:fragment slot="aside">
            <Selector.Checkbox
                id="mfaFactorTotp"
                label="TOTP"
                description="Time-based codes from an authenticator app"
                disabled={!$canWriteProjects}
                bind:checked={totp} />
            <Selector.Checkbox
                id="mfaFactorEmail"
                label="Email"
                description="Codes sent to the user's verified email address"
                disabled={!$canWriteProjects}
                bind:checked={email} />
            <Selector.Checkbox
                id="mfaFactorPhone"
                label="Phone"
                description="Codes sent to the user's verified phone number over SMS"
                disabled={!$canWriteProjects}
                bind:checked={phone} />
            <Selector.Checkbox
                id="mfaFactorCustom"
                label="Custom"
                description="Appwrite generates and verifies the code, and you deliver it through your own channel"
                disabled={!$canWriteProjects}
                bind:checked={custom} />
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button disabled={!$canWriteProjects || isSubmitDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
