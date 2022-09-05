<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        Button,
        Form,
        FormItem,
        InputEmail,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import FormList from '$lib/elements/forms/formList.svelte';

    let name: string, mail: string, pass: string;

    const register = async () => {
        try {
            await sdkForConsole.account.create('unique()', mail, pass, name ?? '');
            await sdkForConsole.account.createEmailSession(mail, pass);
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
    <title>Appwrite - Sign up</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Sign up</svelte:fragment>
    <svelte:fragment>
        <Form on:submit={register}>
            <FormList>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Your name"
                    autofocus={true}
                    bind:value={name} />
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Your email"
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label="Password"
                    placeholder="Your password"
                    required={true}
                    showPasswordButton={true}
                    bind:value={pass} />

                <FormItem>
                    <Button fullWidth submit>Sign up</Button></FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <span class="text">
                Already got an account? <a class="link" href={`${base}/login`}>Sign in</a>
            </span>
        </li>
    </svelte:fragment>
</Unauthenticated>
