<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';

    let userName: string = null;

    onMount(() => {
        userName ??= $user.name;
    });

    async function updateName() {
        try {
            await sdkForProject.users.updateName($user.$id, userName);
            invalidate(Dependencies.USER);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Form on:submit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">Update Name</Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={userName} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userName === $user.name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
