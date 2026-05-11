<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    let { project }: { project: Models.Project } = $props();

    let authCanonicalEmails = $state(false);
    let authDisposableEmails = $state(false);
    let authFreeEmails = $state(false);

    onMount(() => {
        authCanonicalEmails = project?.authCanonicalEmails ?? false;
        authDisposableEmails = project?.authDisposableEmails ?? false;
        authFreeEmails = project?.authFreeEmails ?? false;
    });

    const hasChanges = $derived.by(() => {
        const canonicalChanged = authCanonicalEmails !== (project?.authCanonicalEmails ?? false);
        const disposableChanged = authDisposableEmails !== (project?.authDisposableEmails ?? false);
        const freeChanged = authFreeEmails !== (project?.authFreeEmails ?? false);

        return canonicalChanged || disposableChanged || freeChanged;
    });

    async function updateSignupEmailSecurity() {
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;

            await projectSdk.updateCanonicalEmails({
                enabled: authCanonicalEmails
            });

            await projectSdk.updateDisposableEmails({
                enabled: authDisposableEmails
            });

            await projectSdk.updateFreeEmails({
                enabled: authFreeEmails
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated signup email security settings.'
            });
            trackEvent(Submit.AuthCanonicalEmailsUpdate);
            trackEvent(Submit.AuthDisposableEmailsUpdate);
            trackEvent(Submit.AuthFreeEmailsUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthCanonicalEmailsUpdate);
        }
    }
</script>

<Form onSubmit={updateSignupEmailSecurity}>
    <CardGrid gap="xxl">
        <svelte:fragment slot="title">Signup email security</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={authFreeEmails}
                id="authFreeEmails"
                label="Free email protection">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Block signups and email updates that use free email providers instead of a
                        custom domain.
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authCanonicalEmails}
                id="authCanonicalEmails"
                label="Canonical emails">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Require canonical email addresses by rejecting alias subaddresses and emails
                        with suffixes during signup and email updates.
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authDisposableEmails}
                id="authDisposableEmails"
                label="Disposable email protection">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Block signups and email updates that use known temporary or disposable email
                        domains.
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
