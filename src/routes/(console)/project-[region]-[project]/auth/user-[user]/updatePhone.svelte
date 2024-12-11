<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputPhone } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import { page } from '$app/stores';

    let userPhone: string = null;
    onMount(async () => {
        userPhone ??= $user.phone;
    });

    async function updatePhone() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updatePhone($user.$id, userPhone);
            await invalidate(Dependencies.USER);
            addNotification({
                message: 'Phone has been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdatePhone);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdatePhone);
        }
    }
</script>

<Form onSubmit={updatePhone}>
    <CardGrid>
        <Heading tag="h6" size="7">Phone</Heading>
        <p>
            Update user's phone. Phone number must start with '+' and maximum of 15 digits, for
            example: +14155552671.
        </p>
        <svelte:fragment slot="aside">
            <ul>
                <InputPhone
                    id="phone"
                    label="Phone"
                    placeholder="Enter phone number"
                    autocomplete={false}
                    bind:value={userPhone} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userPhone === $user.phone} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
