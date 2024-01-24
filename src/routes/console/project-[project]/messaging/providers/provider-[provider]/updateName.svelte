<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { provider } from './store';

    let providerName: string = null;
    onMount(async () => {
        providerName ??= $provider.name;
    });

    async function updateName() {
        // TODO: switch on provider and update name
        // try {
        //     await sdk.forProject.users.updateName($provider.$id, providerName);
        //     await invalidate(Dependencies.USER);
        //     addNotification({
        //         message: 'Name has been updated',
        //         type: 'success'
        //     });
        //     trackEvent(Submit.UserUpdateName);
        // } catch (error) {
        //     addNotification({
        //         message: error.message,
        //         type: 'error'
        //     });
        //     trackError(error, Submit.UserUpdateName);
        // }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">Name</Heading>

        <svelte:fragment slot="aside">
            <ul data-private>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={providerName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={providerName === $provider.name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
