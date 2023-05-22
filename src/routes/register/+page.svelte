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
    import { ID } from '@appwrite.io/console';
    import { _ } from 'svelte-i18n';

    let name: string, mail: string, pass: string;
    let terms = false;

    async function register() {
        try {
            await sdk.forConsole.account.create(ID.unique(), mail, pass, name ?? '');
            await sdk.forConsole.account.createEmailSession(mail, pass);
            await invalidate(Dependencies.ACCOUNT);
            await goto(`${base}/console`);
            trackEvent(Submit.AccountCreate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountCreate);
        }
    }
</script>

<svelte:head>
    <title>{$_('sign_up.title')} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">{$_('sign_up.title')}</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={register}>
            <FormList>
                <InputText
                    id="name"
                    label={$_('sign_up.field_inputs.name')}
                    placeholder={$_('globals.placeholders.your_name')}
                    autofocus={true}
                    bind:value={name} />
                <InputEmail
                    id="email"
                    label={$_('sign_up.field_inputs.email')}
                    placeholder={$_('globals.placeholders.your_email')}
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label={$_('sign_up.field_inputs.password')}
                    placeholder={$_('globals.placeholders.your_password')}
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
                    <Button fullWidth submit>{$_('sign_up.title')}</Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <span class="text">
                {$_('sign_up.already_registered')}
                <a class="link" href={`${base}/login`}>{$_('login.title')}</a>
            </span>
        </li>
    </svelte:fragment>
</Unauthenticated>
