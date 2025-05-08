<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';

    let userName: string = null;
    onMount(async () => {
        userName ??= $user.name ?? '';
    });

    async function updateName() {
        try {
            await sdk.forProject.users.updateName($user.$id, userName);
            await invalidate(Dependencies.USER);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <ul data-private>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={userName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userName === $user.name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
