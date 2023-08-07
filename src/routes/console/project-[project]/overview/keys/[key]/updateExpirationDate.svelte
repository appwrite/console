<script lang="ts">
    import { invalidate } from '$app/navigation';
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList } from '$lib/elements/forms';
    import { diffDays } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import ExpirationInput from '../expirationInput.svelte';
    import { key } from './store';

    let expiration = $key.expire;

    async function updateExpire() {
        try {
            await sdk.forConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                $key.scopes,
                expiration
            );
            await invalidate(Dependencies.KEY);
            trackEvent(Submit.KeyUpdateExpire);
            addNotification({
                type: 'success',
                message: $LL.components.notification.apiKeyExpirationUpdated()
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyUpdateExpire);
        }
    }

    let alertsDismissed = false;
    $: isExpiring =
        !alertsDismissed && $key.expire && diffDays(new Date(), new Date($key.expire)) < 14;
    $: isExpired = !alertsDismissed && $key.expire !== null && new Date($key.expire) < new Date();
</script>

<Form onSubmit={updateExpire}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.expirationDate()}</Heading>
        <p class="text">{$LL.console.project.texts.overview.setExpireDate()}</p>
        <svelte:fragment slot="aside">
            {#if isExpired}
                <Alert type="error" dismissible on:dismiss={() => (alertsDismissed = true)}>
                    <span slot="title">{$LL.console.project.texts.overview.expiredApiKey()}</span>
                    <p>
                        {$LL.console.project.texts.overview.deleteExpiredKey()}
                    </p>
                </Alert>
            {:else if isExpiring}
                <Alert type="warning" dismissible on:dismiss={() => (alertsDismissed = true)}>
                    <span slot="title">{$LL.console.project.texts.overview.keyToExpire()}</span>
                    <p>{$LL.console.project.texts.overview.updateExpireDate()}</p>
                </Alert>
            {/if}
            <FormList>
                <ExpirationInput bind:value={expiration} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={expiration === $key.expire} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
