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

    type EnabledPolicy = {
        $id: string;
        enabled: boolean;
    };

    let {
        project,
        denyAliasedEmailPolicy,
        denyDisposableEmailPolicy,
        denyFreeEmailPolicy
    }: {
        project: Models.Project;
        denyAliasedEmailPolicy: EnabledPolicy;
        denyDisposableEmailPolicy: EnabledPolicy;
        denyFreeEmailPolicy: EnabledPolicy;
    } = $props();

    const getInitialAliasedEmails = () => denyAliasedEmailPolicy.enabled;
    const getInitialDisposableEmails = () => denyDisposableEmailPolicy.enabled;
    const getInitialFreeEmails = () => denyFreeEmailPolicy.enabled;

    let savedAliasedEmails = $state(getInitialAliasedEmails());
    let savedDisposableEmails = $state(getInitialDisposableEmails());
    let savedFreeEmails = $state(getInitialFreeEmails());

    let authAliasedEmails = $state(getInitialAliasedEmails());
    let authDisposableEmails = $state(getInitialDisposableEmails());
    let authFreeEmails = $state(getInitialFreeEmails());

    const hasChanges = $derived.by(() => {
        const aliasedChanged = authAliasedEmails !== savedAliasedEmails;
        const disposableChanged = authDisposableEmails !== savedDisposableEmails;
        const freeChanged = authFreeEmails !== savedFreeEmails;

        return aliasedChanged || disposableChanged || freeChanged;
    });

    async function updateSignupEmailSecurity() {
        let currentSubmit = Submit.AuthAliasedEmailsUpdate;
        let hasAppliedServerChange = false;

        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;

            if (authAliasedEmails !== savedAliasedEmails) {
                currentSubmit = Submit.AuthAliasedEmailsUpdate;
                await projectSdk.updateDenyAliasedEmailPolicy({
                    enabled: authAliasedEmails
                });
                hasAppliedServerChange = true;
                trackEvent(Submit.AuthAliasedEmailsUpdate);
            }

            if (authDisposableEmails !== savedDisposableEmails) {
                currentSubmit = Submit.AuthDisposableEmailsUpdate;
                await projectSdk.updateDenyDisposableEmailPolicy({
                    enabled: authDisposableEmails
                });
                hasAppliedServerChange = true;
                trackEvent(Submit.AuthDisposableEmailsUpdate);
            }

            if (authFreeEmails !== savedFreeEmails) {
                currentSubmit = Submit.AuthFreeEmailsUpdate;
                await projectSdk.updateDenyFreeEmailPolicy({
                    enabled: authFreeEmails
                });
                hasAppliedServerChange = true;
                trackEvent(Submit.AuthFreeEmailsUpdate);
            }

            savedAliasedEmails = authAliasedEmails;
            savedDisposableEmails = authDisposableEmails;
            savedFreeEmails = authFreeEmails;
            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated signup email security settings.'
            });
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
        Control which email addresses can be used for user creation and email updates. This does not affect
        session creation (sign in)
        <svelte:fragment slot="aside">
            <InputSwitch bind:value={authFreeEmails} id="authFreeEmails" label="Deny free emails">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="s">
                        <Typography.Text
                            >Block email addresses of free email providers. For example: <Typography.Code
                                >user@gmail.com</Typography.Code>
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authAliasedEmails}
                id="authAliasedEmails"
                label="Deny aliased emails">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="s">
                        <Typography.Text>
                            Block emails with aliases, tags, subaddresses, or any other
                            provider-specific email variations. For example: <Typography.Code
                                >user+folder1@gmail.com</Typography.Code>
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authDisposableEmails}
                id="authDisposableEmails"
                label="Deny disposable emails">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="s">
                        <Typography.Text
                            >Block temporary and disposable email providers. For example: <Typography.Code
                                >alex9734@mailinator.com</Typography.Code>
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
