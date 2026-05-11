<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
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
        let currentSubmit = Submit.AuthCanonicalEmailsUpdate;
        let hasAppliedServerChange = false;

        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;

            currentSubmit = Submit.AuthCanonicalEmailsUpdate;
            await projectSdk.updateCanonicalEmails({
                enabled: authCanonicalEmails
            });
            hasAppliedServerChange = true;

            currentSubmit = Submit.AuthDisposableEmailsUpdate;
            await projectSdk.updateDisposableEmails({
                enabled: authDisposableEmails
            });
            hasAppliedServerChange = true;

            currentSubmit = Submit.AuthFreeEmailsUpdate;
            await projectSdk.updateFreeEmails({
                enabled: authFreeEmails
            });
            hasAppliedServerChange = true;

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated signup email security settings.'
            });
            trackEvent(Submit.AuthCanonicalEmailsUpdate);
            trackEvent(Submit.AuthDisposableEmailsUpdate);
            trackEvent(Submit.AuthFreeEmailsUpdate);
        } catch (error) {
            if (hasAppliedServerChange) {
                await invalidate(Dependencies.PROJECT);
            }

            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, currentSubmit);
        }
    }
</script>

<Form onSubmit={updateSignupEmailSecurity}>
    <CardGrid gap="xxl">
        <svelte:fragment slot="title">Email policies</svelte:fragment>
        Control which email addresses can be used for signups and email updates. This does not affect
        existing sign-ins.
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={authFreeEmails}
                id="authFreeEmails"
                label="Block free email addresses">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="s">
                        <Typography.Text
                            >Only allow email addresses from custom domains.</Typography.Text>
                        <Typography.Text>
                            Examples: <Typography.Code>gmail.com</Typography.Code>, <Typography.Code
                                >yahoo.com</Typography.Code
                            >, <Typography.Code>outlook.com</Typography.Code>
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authCanonicalEmails}
                id="authCanonicalEmails"
                label="Require canonical email addresses">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="s">
                        <Typography.Text>
                            Disallow aliases, tags, and provider-specific email variations.
                        </Typography.Text>
                        <Typography.Text>
                            Examples: <Typography.Code>jane+team@gmail.com</Typography.Code>, <Typography.Code
                                >jane.smith@gmail.com</Typography.Code>
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authDisposableEmails}
                id="authDisposableEmails"
                label="Block disposable email addresses">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="s">
                        <Typography.Text
                            >Disallow temporary and disposable email providers.</Typography.Text>
                        <Typography.Text>
                            Examples: <Typography.Code>mailinator.com</Typography.Code>, <Typography.Code
                                >10minutemail.com</Typography.Code>
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>
            </InputSwitch>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
