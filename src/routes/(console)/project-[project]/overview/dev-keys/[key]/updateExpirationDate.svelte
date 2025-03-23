<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { diffDays } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { project } from '../../../store';
    import { devKey } from './store';
    import ExpirationInput from '../../components/expirationInput.svelte';

    let expiration = $devKey.expire;

    async function updateExpire() {
        try {
            await sdk.forConsole.projects.updateDevKey(
                $project.$id,
                $devKey.$id,
                $devKey.name,
                expiration
            );
            await invalidate(Dependencies.DEV_KEY);
            trackEvent(Submit.DevKeyUpdateExpire);
            addNotification({
                type: 'success',
                message: 'Dev key expiration has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DevKeyUpdateExpire);
        }
    }

    let alertsDismissed = false;
    $: isExpiring =
        !alertsDismissed && $devKey.expire && diffDays(new Date(), new Date($devKey.expire)) < 14;
    $: isExpired =
        !alertsDismissed && $devKey.expire !== null && new Date($devKey.expire) < new Date();
</script>

<Form onSubmit={updateExpire}>
    <CardGrid>
        <svelte:fragment slot="title">Expiration date</svelte:fragment>
        Set a date after which your Dev key will expire.
        <svelte:fragment slot="aside">
            {#if isExpired}
                <Alert.Inline
                    status="error"
                    on:dismiss={() => (alertsDismissed = true)}
                    title="Your Dev key has expired">
                    For security reasons, we recommend you delete your expired key and create a new
                    one.
                </Alert.Inline>
            {:else if isExpiring}
                <Alert.Inline
                    status="warning"
                    on:dismiss={() => (alertsDismissed = true)}
                    title="Your Dev key is about to expire">
                    Update the expiration date to keep the key active
                </Alert.Inline>
            {/if}
            <ExpirationInput bind:value={expiration} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={expiration === $devKey.expire} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
