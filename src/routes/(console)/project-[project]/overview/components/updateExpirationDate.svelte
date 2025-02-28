<script lang="ts">
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList } from '$lib/elements/forms';
    import { diffDays } from '$lib/helpers/date';
    import ExpirationInput from './expirationInput.svelte';
    import type { Models } from '@appwrite.io/console';

    export let key: Models.Key | Models.DevKey;
    export let resourceType: 'API' | 'Dev' = 'API';
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void;

    let expiration = key.expire;

    let alertsDismissed = false;
    $: isExpiring =
        !alertsDismissed && key.expire && diffDays(new Date(), new Date(key.expire)) < 14;
    $: isExpired = !alertsDismissed && key.expire !== null && new Date(key.expire) < new Date();
</script>

<Form {onSubmit}>
    <CardGrid>
        <Heading tag="h6" size="7">Expiration date</Heading>
        <p class="text">Set a date after which your {resourceType} key will expire.</p>
        <svelte:fragment slot="aside">
            {#if isExpired}
                <Alert type="error" dismissible on:dismiss={() => (alertsDismissed = true)}>
                    <span slot="title">Your {resourceType} key has expired</span>
                    <p>
                        For security reasons, we recommend you delete your expired key and create a
                        new one.
                    </p>
                </Alert>
            {:else if isExpiring}
                <Alert type="warning" dismissible on:dismiss={() => (alertsDismissed = true)}>
                    <span slot="title">Your {resourceType} key is about to expire</span>
                    <p>Update the expiration date to keep the key active</p>
                </Alert>
            {/if}
            <FormList>
                <ExpirationInput bind:value={key.expire} {resourceType} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={expiration === key.expire} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
