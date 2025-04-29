<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputEmail } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';

    let userEmail: string = null;
    onMount(async () => {
        userEmail ??= $user.email;
    });

    async function updateEmail() {
        try {
            await sdk.forProject.users.updateEmail($user.$id, userEmail);
            await invalidate(Dependencies.USER);
            addNotification({
                message: 'Email has been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdateEmail);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateEmail);
        }
    }
</script>

<Form onSubmit={updateEmail}>
    <CardGrid>
        <svelte:fragment slot="title">Email</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputEmail
                id="email"
                label="Email"
                placeholder="Enter email"
                autocomplete={false}
                bind:value={userEmail} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userEmail === $user.email} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
