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
                message: 'Name has been updated',
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
                message: 'Email has been updated',
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
                message: 'Password has been updated',
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
            <Heading tag="h6" size="7">Name</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText id="name" label="Name" placeholder="Enter name" bind:value={name} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $user.name || !name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form onSubmit={updateEmail}>
        <CardGrid>
            <Heading tag="h6" size="7">Email</Heading>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="email"
                        label="Email"
                        placeholder="Enter email"
                        bind:value={email} />
                    {#if email !== $user.email && email}
                        <InputPassword
                            id="emailPassword"
                            label="Password"
                            placeholder="Enter password"
                            showPasswordButton={true}
                            bind:value={emailPassword} />
                    {/if}
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={email === $user.email || !email || !emailPassword} submit
                    >Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form onSubmit={updatePassword}>
        <CardGrid>
            <Heading tag="h6" size="7">Password</Heading>
            <p class="text">
                Forgot your password? <a class="link" href={`${base}/recover`}
                    >Recover your password</a>
            </p>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputPassword
                        id="oldPassword"
                        label="Old password"
                        placeholder="Enter password"
                        showPasswordButton={true}
                        bind:value={oldPassword} />
                    <InputPassword
                        id="newPassword"
                        label="New password"
                        placeholder="Enter password"
                        showPasswordButton={true}
                        bind:value={newPassword} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!newPassword || !oldPassword} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete account</Heading>
        </div>
        <p>
            Your account will be permanently deleted and access will be lost to any of your teams
            and data. This action is irreversible.
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
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
