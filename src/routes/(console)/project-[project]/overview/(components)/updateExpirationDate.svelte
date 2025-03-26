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
    import ExpirationInput from './expirationInput.svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';

    export let keyType: 'api' | 'dev' = 'api';
    export let key: Models.DevKey | Models.Key;

    const projectId = $page.params.project;

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'Dev';
    const dependency = isApiKey ? Dependencies.KEY : Dependencies.DEV_KEY;
    const event = isApiKey ? Submit.KeyUpdateExpire : Submit.DevKeyUpdateExpire;

    let expiration = key.expire;

    async function updateExpire() {
        try {
            isApiKey
                ? await sdk.forConsole.projects.updateKey(
                      projectId,
                      key.$id,
                      key.name,
                      (key as Models.Key).scopes,
                      expiration
                  )
                : await sdk.forConsole.projects.updateDevKey(
                      projectId,
                      key.$id,
                      key.name,
                      expiration
                  );

            await invalidate(dependency);
            trackEvent(event);
            addNotification({
                type: 'success',
                message: `${label} key expiration has been updated`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, event);
        }
    }

    let alertsDismissed = false;
    $: isExpiring =
        !alertsDismissed && key.expire && diffDays(new Date(), new Date(key.expire)) < 14;
    $: isExpired = !alertsDismissed && key.expire !== null && new Date(key.expire) < new Date();

    // for comparison's sake.
    $: disableButton =
        // expiration becomes `null` in `ExpirationInput`.
        typeof key?.expire === 'undefined' && expiration === null
            ? true
            : isSameDay(new Date(expiration), new Date(key?.expire));
</script>

<Form onSubmit={updateExpire}>
    <CardGrid>
        <svelte:fragment slot="title">Expiration date</svelte:fragment>
        Set a date after which your {label} key will expire.
        <svelte:fragment slot="aside">
            {#if isExpired}
                <Alert.Inline
                    status="error"
                    on:dismiss={() => (alertsDismissed = true)}
                    title="Your {label} key has expired">
                    For security reasons, we recommend you delete your expired key and create a new
                    one.
                </Alert.Inline>
            {:else if isExpiring}
                <Alert.Inline
                    status="warning"
                    on:dismiss={() => (alertsDismissed = true)}
                    title="Your {label} key is about to expire">
                    Update the expiration date to keep the key active
                </Alert.Inline>
            {/if}
            <ExpirationInput bind:value={expiration} {keyType} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={disableButton} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
