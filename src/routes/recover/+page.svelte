<script lang="ts">
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
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { _ } from 'svelte-i18n';

    let email: string;
    let userId: string;
    let secret: string;

    let password: string;
    let confirmPassword: string;

    onMount(() => {
        userId = $page.url.searchParams.get('userId');
        secret = $page.url.searchParams.get('secret');
    });

    async function recover() {
        try {
            await sdk.forConsole.account.createRecovery(email, window.location.toString());
            addNotification({
                type: 'success',
                message: 'We have sent you an email with a password reset link'
            });
            trackEvent(Submit.AccountRecover);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountRecover);
        }
    }

    async function setPassword() {
        try {
            await sdk.forConsole.account.updateRecovery(userId, secret, password, confirmPassword);
            await goto(`${base}/login`);
            addNotification({
                type: 'success',
                message: 'Password has been updated successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<svelte:head>
    <title>{$_('globals.recover')} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">{$_('password_recovery.title')}</svelte:fragment>
    <svelte:fragment>
        {#if userId && secret}
            <Form onSubmit={setPassword}>
                <FormList>
                    <InputPassword
                        label={$_('password_recovery.field_inputs.new_password')}
                        placeholder={$_('globals.placeholders.enter_password')}
                        id="password"
                        autofocus={true}
                        required={true}
                        showPasswordButton={true}
                        bind:value={password} />
                    <InputPassword
                        label={$_('password_recovery.field_inputs.cnf_password')}
                        placeholder={$_('globals.placeholders.confirm_password')}
                        id="confirm-password"
                        required={true}
                        showPasswordButton={true}
                        bind:value={confirmPassword} />

                    <FormItem>
                        <Button fullWidth submit>{$_('globals.update')}</Button>
                    </FormItem>
                </FormList>
            </Form>
        {:else}
            <Form onSubmit={recover}>
                <FormList>
                    <InputEmail
                        id="email"
                        label={$_('password_recovery.field_inputs.email')}
                        placeholder={$_('globals.placeholders.email')}
                        autofocus={true}
                        required={true}
                        bind:value={email} />

                    <FormItem>
                        <Button fullWidth submit>{$_('globals.recover')}</Button>
                    </FormItem>
                </FormList>
            </Form>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/login`}><span class="text">{$_('login.title')}</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">{$_('sign_up.title')}</span></a>
        </li>
    </svelte:fragment>
</Unauthenticated>
