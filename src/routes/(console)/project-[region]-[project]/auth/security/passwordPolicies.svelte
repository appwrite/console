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

    let {
        project,
        dictionaryPolicy,
        historyPolicy,
        personalDataPolicy
    }: {
        project: Models.Project;
        dictionaryPolicy: Models.PolicyPasswordDictionary;
        historyPolicy: Models.PolicyPasswordHistory;
        personalDataPolicy: Models.PolicyPasswordPersonalData;
    } = $props();

    const getInitialHistoryLimit = () => (historyPolicy.total > 0 ? historyPolicy.total : 5);
    const getInitialHistoryEnabled = () => historyPolicy.total > 0;
    const getInitialDictionary = () => dictionaryPolicy.enabled;
    const getInitialPersonalDataCheck = () => personalDataPolicy.enabled;

    let savedHistoryLimit = $state(getInitialHistoryLimit());
    let savedHistoryEnabled = $state(getInitialHistoryEnabled());
    let savedDictionary = $state(getInitialDictionary());
    let savedPersonalDataCheck = $state(getInitialPersonalDataCheck());

    let lastValidHistoryLimit = $state(getInitialHistoryLimit());
    let passwordHistoryLimit = $state(getInitialHistoryLimit());
    let passwordDictionary = $state(getInitialDictionary());
    let passwordHistoryEnabled = $state(getInitialHistoryEnabled());
    let authPersonalDataCheck = $state(getInitialPersonalDataCheck());

    $effect(() => {
        // restore last valid limit when enabling
        if (passwordHistoryEnabled && passwordHistoryLimit < 1) {
            passwordHistoryLimit = lastValidHistoryLimit;
        }

        if (passwordHistoryLimit > 0) {
            lastValidHistoryLimit = passwordHistoryLimit;
        }
    });

    const hasChanges = $derived.by(() => {
        const dictChanged = passwordDictionary !== savedDictionary;
        const dataCheckChanged = authPersonalDataCheck !== savedPersonalDataCheck;
        const historyChanged = passwordHistoryEnabled !== savedHistoryEnabled;
        const limitChanged =
            passwordHistoryEnabled && Number(passwordHistoryLimit) !== savedHistoryLimit;

        return historyChanged || dictChanged || dataCheckChanged || limitChanged;
    });

    async function updatePasswordPolicies() {
        let currentSubmit = Submit.AuthPasswordHistoryUpdate;
        let hasAppliedServerChange = false;

        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;

            if (
                passwordHistoryEnabled !== savedHistoryEnabled ||
                (passwordHistoryEnabled && Number(passwordHistoryLimit) !== savedHistoryLimit)
            ) {
                currentSubmit = Submit.AuthPasswordHistoryUpdate;
                await projectSdk.updatePasswordHistoryPolicy({
                    total: passwordHistoryEnabled ? passwordHistoryLimit : null
                });
                hasAppliedServerChange = true;
                trackEvent(Submit.AuthPasswordHistoryUpdate);
            }

            if (passwordDictionary !== savedDictionary) {
                currentSubmit = Submit.AuthPasswordDictionaryUpdate;
                await projectSdk.updatePasswordDictionaryPolicy({
                    enabled: passwordDictionary
                });
                hasAppliedServerChange = true;
                trackEvent(Submit.AuthPasswordDictionaryUpdate);
            }

            if (authPersonalDataCheck !== savedPersonalDataCheck) {
                currentSubmit = Submit.AuthPersonalDataCheckUpdate;
                await projectSdk.updatePasswordPersonalDataPolicy({
                    enabled: authPersonalDataCheck
                });
                hasAppliedServerChange = true;
                trackEvent(Submit.AuthPersonalDataCheckUpdate);
            }

            savedHistoryLimit = passwordHistoryLimit;
            savedHistoryEnabled = passwordHistoryEnabled;
            savedDictionary = passwordDictionary;
            savedPersonalDataCheck = authPersonalDataCheck;

            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated password policies.'
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
                                bind:value={passwordHistoryLimit}
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
