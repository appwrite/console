<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography, Link, Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { tick } from 'svelte';

    let { project }: { project: Models.Project } = $props();

    let passwordHistory = $state(5);
    let passwordHistoryEnabled = $state(false);
    let passwordDictionary = $state(false);
    let authPersonalDataCheck = $state(false);

    let maxPasswordInputField: InputNumber | null = null;

    // Initialize and sync state when project updates
    $effect(() => {
        const historyValue = project?.authPasswordHistory;
        passwordHistory = historyValue < 1 ? 5 : historyValue;
        passwordHistoryEnabled = (historyValue ?? 0) !== 0;
        passwordDictionary = project?.authPasswordDictionary ?? false;
        authPersonalDataCheck = project?.authPersonalDataCheck ?? false;
    });

    $effect(() => {
        if (passwordHistoryEnabled) {
            tick().then(() => {
                if (maxPasswordInputField) {
                    maxPasswordInputField.addInputFocus();
                }
            });
        }
    });

    const hasChanges = $derived(
        passwordHistoryEnabled !== ((project?.authPasswordHistory ?? 0) !== 0) ||
            (passwordHistoryEnabled && passwordHistory !== (project?.authPasswordHistory ?? 0)) ||
            passwordDictionary !== (project?.authPasswordDictionary ?? false) ||
            authPersonalDataCheck !== (project?.authPersonalDataCheck ?? false)
    );

    async function updatePasswordPolicies() {
        try {
            await Promise.all([
                sdk.forConsole.projects.updateAuthPasswordHistory({
                    projectId: project.$id,
                    limit: passwordHistoryEnabled ? passwordHistory : 0
                }),
                sdk.forConsole.projects.updateAuthPasswordDictionary({
                    projectId: project.$id,
                    enabled: passwordDictionary
                }),
                sdk.forConsole.projects.updatePersonalDataCheck({
                    projectId: project.$id,
                    enabled: authPersonalDataCheck
                })
            ]);

            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated password policies.'
            });
            trackEvent(Submit.AuthPasswordHistoryUpdate);
            trackEvent(Submit.AuthPasswordDictionaryUpdate);
            trackEvent(Submit.AuthPersonalDataCheckUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthPasswordHistoryUpdate);
        }
    }
</script>

<Form onSubmit={updatePasswordPolicies}>
    <CardGrid gap="xxl">
        <svelte:fragment slot="title">Password policies</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={passwordHistoryEnabled}
                id="passwordHistoryEnabled"
                label="Password history">
                <svelte:fragment slot="description">
                    <Layout.Stack gap="m">
                        <Typography.Text>
                            Enabling this option prevents users from reusing recent passwords by
                            comparing the new password with their password history.
                        </Typography.Text>
                        {#if passwordHistoryEnabled}
                            <InputNumber
                                required
                                max={20}
                                min={1}
                                id="password-history"
                                label="Limit"
                                bind:value={passwordHistory}
                                bind:this={maxPasswordInputField}
                                helper="Maximum 20 passwords." />
                        {/if}
                    </Layout.Stack>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={passwordDictionary}
                id="passwordDictionary"
                label="Password dictionary">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Enabling this option prevents users from setting insecure passwords by
                        comparing the user's password with the <Link.Anchor
                            target="_blank"
                            rel="noopener noreferrer"
                            class="link"
                            href="https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt"
                            >10k most commonly used passwords.</Link.Anchor>
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={authPersonalDataCheck}
                id="personalDataCheck"
                label="Disallow personal data">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Do not allow passwords that contain any part of the user's personal data.
                        This includes the user's <Typography.Code>name</Typography.Code>, <Typography.Code
                            >email</Typography.Code
                        >, or <Typography.Code>phone</Typography.Code>.
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
