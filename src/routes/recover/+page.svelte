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
    import LL from '$i18n/i18n-svelte';

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
                message: $LL.components.notification.sentPswdLink()
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
                message: $LL.components.notification.pswdUpdatedSuccessfully()
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
    <title>{$LL.recover.title.pageHeader()} - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">{$LL.recover.title.pageTitle()}</svelte:fragment>
    <svelte:fragment>
        {#if userId && secret}
            <Form onSubmit={setPassword}>
                <FormList>
                    <InputPassword
                        label={$LL.recover.forms.resetPassword.inputs.password.label()}
                        placeholder={$LL.recover.forms.resetPassword.inputs.password.placeholder()}
                        id="password"
                        autofocus={true}
                        required={true}
                        showPasswordButton={true}
                        bind:value={password} />
                    <InputPassword
                        label={$LL.recover.forms.resetPassword.inputs.cnfPassword.label()}
                        placeholder={$LL.recover.forms.resetPassword.inputs.cnfPassword.placeholder()}
                        id="confirm-password"
                        required={true}
                        showPasswordButton={true}
                        bind:value={confirmPassword} />

                    <FormItem>
                        <Button fullWidth submit>{$LL.recover.button.submit.update()}</Button>
                    </FormItem>
                </FormList>
            </Form>
        {:else}
            <Form onSubmit={recover}>
                <FormList>
                    <InputEmail
                        id="email"
                        label={$LL.recover.forms.resetPassword.inputs.email.label()}
                        placeholder={$LL.recover.forms.resetPassword.inputs.email.placeholder()}
                        autofocus={true}
                        required={true}
                        bind:value={email} />

                    <FormItem>
                        <Button fullWidth submit>{$LL.recover.button.submit.recover()}</Button>
                    </FormItem>
                </FormList>
            </Form>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/login`}><span class="text">{$LL.recover.links.login()}</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}
                ><span class="text">{$LL.recover.links.register()}</span></a>
        </li>
    </svelte:fragment>
</Unauthenticated>
