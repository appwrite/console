<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputEmail } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';

    let userEmail: string = null;

    onMount(() => {
        userEmail ??= $user.email;
    });

    async function updateEmail() {
        try {
            await sdkForProject.users.updateEmail($user.$id, userEmail);
            invalidate(Dependencies.USER);
            addNotification({
                message: 'Email has been updated',
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

<Form on:submit={updateEmail}>
    <CardGrid>
        <Heading tag="h6" size="7">Update Email</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Enter email"
                    autocomplete={false}
                    bind:value={userEmail} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userEmail === $user.email} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
