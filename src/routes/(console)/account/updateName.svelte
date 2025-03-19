<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';

    let name: string = null;

    onMount(async () => {
        name ??= $user.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.account.updateName(name);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.AccountUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>

        <svelte:fragment slot="aside">
            <InputText id="name" label="Name" placeholder="Enter name" bind:value={name} required />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={name === $user.name || !name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
