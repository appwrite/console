<script lang="ts">
    import { Button, Form, FormList, InputText, InputPassword } from '$lib/elements/forms';
    import { CardGrid, Box, Heading, AvatarInitials } from '$lib/components';
    import { Container } from '$lib/layout';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/user';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import Delete from './delete.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    let name: string = null,
        email: string = null,
        emailPassword: string = null,
        newPassword: string = null,
        oldPassword: string = null;
    let showDelete = false;

    onMount(async () => {
        name ??= $user.name;
        email ??= $user.email;
    });

    async function updateName() {
        try {
            await sdk.forConsole.account.updateName(name);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                message: $LL.components.notification.nameUpdated(),
                type: 'success'
            });
            trackEvent(Submit.AccountUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdateName);
        }
    }

    async function updateEmail() {
        try {
            await sdk.forConsole.account.updateEmail(email, emailPassword);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                message: $LL.components.notification.emailUpdated(),
                type: 'success'
            });
            trackEvent(Submit.AccountUpdateEmail);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdateEmail);
        }
    }

    async function updatePassword() {
        try {
            await sdk.forConsole.account.updatePassword(newPassword, oldPassword);
            newPassword = oldPassword = null;
            addNotification({
                message: $LL.components.notification.pswdUpdated(),
                type: 'success'
            });
            trackEvent(Submit.AccountUpdatePassword);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdatePassword);
        }
    }
</script>

<Container>
    <Form onSubmit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.account.forms.updateName.title()}</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label={$LL.console.account.forms.updateName.inputs.name.label()}
                        placeholder={$LL.console.account.forms.updateName.inputs.name.placeholder()}
                        bind:value={name} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $user.name || !name} submit
                    >{$LL.console.account.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form onSubmit={updateEmail}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.account.forms.updateEmail.title()}</Heading>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="email"
                        label={$LL.console.account.forms.updateEmail.inputs.email.label()}
                        placeholder={$LL.console.account.forms.updateEmail.inputs.email.placeholder()}
                        bind:value={email} />
                    {#if email !== $user.email && email}
                        <InputPassword
                            id="emailPassword"
                            label={$LL.console.account.forms.updateEmail.inputs.password.label()}
                            placeholder={$LL.console.account.forms.updateEmail.inputs.password.placeholder()}
                            showPasswordButton={true}
                            bind:value={emailPassword} />
                    {/if}
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={email === $user.email || !email || !emailPassword} submit
                    >{$LL.console.account.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form onSubmit={updatePassword}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.account.forms.updatePassword.title()}</Heading>
            <p class="text">
                {$LL.console.account.forms.updatePassword.texts.forgotPassword()}
                <a class="link" href={`${base}/recover`}
                    >{$LL.console.account.forms.updatePassword.texts.recoverPassword()}</a>
            </p>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputPassword
                        id="oldPassword"
                        label={$LL.console.account.forms.updatePassword.inputs.oldPassword.label()}
                        placeholder={$LL.console.account.forms.updatePassword.inputs.oldPassword.placeholder()}
                        showPasswordButton={true}
                        bind:value={oldPassword} />
                    <InputPassword
                        id="newPassword"
                        label={$LL.console.account.forms.updatePassword.inputs.newPassword.label()}
                        placeholder={$LL.console.account.forms.updatePassword.inputs.newPassword.placeholder()}
                        showPasswordButton={true}
                        bind:value={newPassword} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!newPassword || !oldPassword} submit
                    >{$LL.console.account.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">{$LL.console.account.title.deleteAccount()}</Heading>
        </div>
        <p>
            {$LL.console.account.texts.deleteAccount()}
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="image">
                    <AvatarInitials size={48} name={$user.name} />
                </svelte:fragment>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$user.name}</h6>
                </svelte:fragment>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}
                >{$LL.console.account.button.submit.delete()}</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
