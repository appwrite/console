<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        Button,
        Form,
        FormItem,
        FormList,
        InputEmail,
        InputPassword
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    let mail: string, pass: string;

    const login = async () => {
        try {
            await sdkForConsole.account.createEmailSession(mail, pass);
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
    <title>Login</title>
</svelte:head>

<h1>Login</h1>

<Form on:submit={login}>
    <FormList>
        <InputEmail
            id="email"
            label="Email"
            placeholder="Enter email"
            autofocus={true}
            required={true}
            bind:value={mail} />
        <InputPassword
            id="password"
            label="Password"
            placeholder="Enter password"
            required={true}
            meter={false}
            bind:value={pass} />
        <FormItem>
            <Button submit>Login</Button>
        </FormItem>
    </FormList>
</Form>

<a href={`${base}/register`}>Create an Account</a>
