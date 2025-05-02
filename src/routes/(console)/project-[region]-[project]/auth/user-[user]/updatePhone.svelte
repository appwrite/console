<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputPhone } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import { page } from '$app/state';

    let userPhone: string = null;
    onMount(async () => {
        userPhone ??= $user.phone;
    });

    async function updatePhone() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
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
        <svelte:fragment slot="title">Phone</svelte:fragment>
        Phone number must start with '+' and maximum of 15 digits.
        <svelte:fragment slot="aside">
            <InputPhone
                id="phone"
                label="Phone"
                placeholder="For example: +14155552671"
                autocomplete={false}
                bind:value={userPhone} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userPhone === $user.phone} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
