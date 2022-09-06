<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, FormList, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { Unauthenticated } from '$lib/layout';
    import { page } from '$app/stores';

    let terms = false;
    const acceptInvite = async () => {
        console.log($page);
        try {
            // await sdkForConsole.account.createEmailSession(mail, pass);
            user.fetchUser();
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            await goto(`${base}/console`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<svelte:head>
    <title>Appwrite - Accept invite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Invite</svelte:fragment>
    <svelte:fragment>
        <Form on:submit={acceptInvite}>
            <FormList>
                <InputCheckbox bind:value={terms} id="terms" label="terms" />

                <Button secondary>Cancel</Button>
                <Button submit>Accept</Button>
            </FormList>
        </Form>
    </svelte:fragment>
</Unauthenticated>
