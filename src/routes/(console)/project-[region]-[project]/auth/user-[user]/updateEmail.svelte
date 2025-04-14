<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputEmail } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import { page } from '$app/stores';

    let userEmail: string = null;

    onMount(async () => {
        userEmail ??= $user.email;
    });

    async function updateEmail() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updateEmail($user.$id, userEmail);
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
        <Heading tag="h6" size="7">Email</Heading>
        <p>
            Update user's email. An Email should be formatted as: <span class="inline-code"
                >name@example.com</span
            >.
        </p>
        <svelte:fragment slot="aside">
            <ul>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Enter email"
                    autocomplete={false}
                    bind:value={userEmail} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userEmail === $user.email} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
