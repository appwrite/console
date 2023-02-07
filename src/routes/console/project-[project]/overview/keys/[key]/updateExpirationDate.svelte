<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import CardGrid from '$lib/components/cardGrid.svelte';
    import Heading from '$lib/components/heading.svelte';
    import { Dependencies } from '$lib/constants';
    import { Form } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import ExpirationInput from '../expirationInput.svelte';
    import { key } from './store';

    let expiration = $key.expire;

    async function updateExpire() {
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                $key.scopes,
                expiration
            );
            invalidate(Dependencies.KEY);
            trackEvent('submit_key_update_expire');
            addNotification({
                type: 'success',
                message: 'API Key expiration has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form on:submit={updateExpire}>
    <CardGrid>
        <Heading tag="h6" size="7">Update Expiration Date</Heading>
        <p class="text">Choose any name that will help you distinguish between API keys.</p>
        <svelte:fragment slot="aside">
            <FormList>
                <ExpirationInput bind:value={expiration} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={expiration === $key.expire} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
