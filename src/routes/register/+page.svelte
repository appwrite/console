<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        Button,
        Form,
        FormItem,
        InputChoice,
        InputEmail,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@aw-labs/appwrite-console';

    let name: string, mail: string, pass: string, disabled: boolean;
    let terms = false;

    async function register() {
        try {
            disabled = true;
            await sdk.forConsole.account.create(ID.unique(), mail, pass, name ?? '');
            await sdk.forConsole.account.createEmailSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            await goto(`${base}/console`);
            trackEvent(Submit.AccountCreate);
        } catch (error) {
            disabled = false;
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountCreate);
        }
    }
</script>

<svelte:head>
    <title>Sign up - Appwrite</title>
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
                <InputChoice required value={terms} id="terms" label="terms" showLabel={false}>
                    By registering, you agree that you have read, understand, and acknowledge our <a
                        class="link"
                        href="https://appwrite.io/policy/privacy"
                        target="_blank"
                        rel="noopener noreferrer">
                        Privacy Policy</a>
                    and accept our
                    <a
                        class="link"
                        href="https://appwrite.io/policy/terms"
                        target="_blank"
                        rel="noopener noreferrer">General Terms of Use</a
                    >.</InputChoice>
                <FormItem>
                    <Button fullWidth submit {disabled}>Sign up</Button>
                </FormItem>
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
