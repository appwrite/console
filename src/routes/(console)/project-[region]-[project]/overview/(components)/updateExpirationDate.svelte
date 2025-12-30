<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { diffDays, isSameDay } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { ExpirationInput } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';

    export let keyType: 'api' | 'dev' | 'organization' | 'account' = 'api';
    export let key: Models.DevKey | Models.Key;

    const projectId = page.params.project;

    function getLabel() {
        switch (keyType) {
            case 'api':
                return 'API key';
            case 'dev':
                return 'Dev key';
            case 'organization':
                return 'Organization key';
            case 'account':
                return 'Account token';
        }
    }

    function getExpiryOptions() {
        switch (keyType) {
            case 'api':
            case 'organization':
            case 'account':
                return 'default';
            case 'dev':
                return 'limited';
        }
    }

    function getDependency() {
        switch (keyType) {
            case 'api':
                return Dependencies.KEY;
            case 'dev':
                return Dependencies.DEV_KEY;
            case 'organization':
                return Dependencies.ORGANIZATION;
            case 'account':
                return Dependencies.ACCOUNT;
        }
    }

    function getEvent() {
        switch (keyType) {
            case 'api':
                return Submit.KeyUpdateExpire;
            case 'dev':
                return Submit.DevKeyUpdateExpire;
            case 'organization':
                return Submit.OrganizationKeyUpdateExpire;
            case 'account':
                return Submit.AccountTokenUpdateExpire;
        }
    }

    let expiration = key.expire;

    async function updateExpire() {
        try {
            switch (keyType) {
                case 'api':
                    await sdk.forConsole.projects.updateKey({
                        projectId,
                        keyId: key.$id,
                        name: key.name,
                        scopes: (key as Models.Key).scopes,
                        expire: expiration === '' ? null : expiration
                    });
                    break;
                case 'dev':
                    await sdk.forConsole.projects.updateDevKey({
                        projectId,
                        keyId: key.$id,
                        name: key.name,
                        expire: expiration === '' ? null : expiration
                    });
                    break;
                case 'organization':
                    await sdk.forConsole.organizations.updateKey({
                        organizationId: page.params.organization,
                        keyId: key.$id,
                        name: key.name,
                        scopes: (key as Models.Key).scopes,
                        expire: expiration === '' ? null : expiration
                    });
                    break;
                case 'account':
                    await sdk.forConsole.account.updateKey({
                        keyId: key.$id,
                        name: key.name,
                        scopes: (key as Models.Key).scopes,
                        expire: expiration === '' ? null : expiration
                    });
                    break;
            }

            await invalidate(getDependency());
            trackEvent(getEvent());
            addNotification({
                type: 'success',
                message: `${getLabel()} expiration has been updated`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, getEvent());
        }
    }

    let alertsDismissed = false;
    $: isExpiring =
        !alertsDismissed && key.expire && diffDays(new Date(), new Date(key.expire)) < 14;
    $: isExpired = !alertsDismissed && key.expire !== null && new Date(key.expire) < new Date();

    let disableButton = false;
    $: {
        // Normalize values
        const isKeyExpireEmpty = !key?.expire || key.expire === '' || key.expire === 'n/a';
        const isExpirationEmpty = !expiration || expiration === '' || expiration === 'n/a';

        // Compare values
        if (isKeyExpireEmpty && isExpirationEmpty) {
            disableButton = true;
        } else if (isKeyExpireEmpty || isExpirationEmpty) {
            disableButton = false;
        } else {
            disableButton = isSameDay(new Date(expiration), new Date(key.expire));
        }
    }

    // don't show an expiry related alert if key was created less than 5 mins ago!
    $: showAlert = Date.now() - new Date(key.$createdAt).getTime() > 5 * 60 * 1000;
</script>

<Form onSubmit={updateExpire}>
    <CardGrid>
        <svelte:fragment slot="title">Expiration date</svelte:fragment>
        Set a date after which your {getLabel()} will expire.
        <svelte:fragment slot="aside">
            {#if (isExpired || isExpiring) && showAlert}
                <Alert.Inline
                    status={isExpired && keyType === 'api' ? 'error' : 'warning'}
                    on:dismiss={() => (alertsDismissed = true)}
                    title={`Your ${getLabel()} ${isExpired ? 'has expired' : 'is about to expire'}`}>
                    Update the expiration date to keep the key active.
                </Alert.Inline>
            {/if}
            <ExpirationInput bind:value={expiration} expiryOptions={getExpiryOptions()} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={disableButton} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
