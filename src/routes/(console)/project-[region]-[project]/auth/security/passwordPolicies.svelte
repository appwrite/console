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
    import { onMount } from 'svelte';

    let {
        project
    }: {
        project: Models.Project;
    } = $props();

    let lastValidLimit = $state(5);
    let passwordHistory = $state(5);
    let passwordDictionary = $state(false);
    let passwordHistoryEnabled = $state(false);
    let authPersonalDataCheck = $state(false);

    onMount(() => {
        // update initial states here in onMount.
        const historyValue = project.authPasswordHistory;
        if (historyValue && historyValue > 0) {
            passwordHistory = historyValue;
            lastValidLimit = historyValue;
        }

        passwordHistoryEnabled = (historyValue ?? 0) !== 0;
        passwordDictionary = project.authPasswordDictionary ?? false;
        authPersonalDataCheck = project.authPersonalDataCheck ?? false;
    });

    $effect(() => {
        // restore last valid limit when enabling
        if (passwordHistoryEnabled && passwordHistory < 1) {
            passwordHistory = lastValidLimit;
        }
    });

    const hasChanges = $derived.by(() => {
        const dictChanged = passwordDictionary !== (project.authPasswordDictionary ?? false);
        const dataCheckChanged = authPersonalDataCheck !== (project.authPersonalDataCheck ?? false);
        const historyChanged =
            passwordHistoryEnabled !== ((project.authPasswordHistory ?? 0) !== 0);
        const limitChanged =
            passwordHistoryEnabled &&
            Number(passwordHistory) !== (project.authPasswordHistory ?? 0);

        return historyChanged || dictChanged || dataCheckChanged || limitChanged;
    });

    async function updatePasswordPolicies() {
        try {
            const projectSdk = sdk.forConsole.projects;

            await projectSdk.updateAuthPasswordHistory({
                projectId: project.$id,
                limit: passwordHistoryEnabled ? passwordHistory : 0
            });

            await projectSdk.updateAuthPasswordDictionary({
                projectId: project.$id,
                enabled: passwordDictionary
            });

            await projectSdk.updatePersonalDataCheck({
                projectId: project.$id,
                enabled: authPersonalDataCheck
            });

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
                                autofocus
                                label="Limit"
                                id="password-history"
                                bind:value={passwordHistory}
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
