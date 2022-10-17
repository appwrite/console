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
    import { Unauthenticated } from '$lib/layout';

    let mail: string, pass: string;

    const login = async () => {
        try {
            await sdkForConsole.account.createEmailSession(mail, pass);
            await user.fetchUser();
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
    <title>Appwrite - Sign in</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Sign in</svelte:fragment>
    <svelte:fragment>
        <Form on:submit={login}>
            <FormList>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Email"
                    autofocus={true}
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label="Password"
                    placeholder="Password"
                    required={true}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={pass} />
                <FormItem>
                    <Button fullWidth submit>Sign in</Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/recover`}><span class="text">Forgot Password?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">Sign Up</span></a>
        </li>
    </svelte:fragment>
</Unauthenticated>
