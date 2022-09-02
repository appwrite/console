<script lang="ts">
    import { Button, Form, FormList, InputText, InputPassword } from '$lib/elements/forms';
    import { CardGrid, Box, Avatar } from '$lib/components';
    import { Container } from '$lib/layout';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/user';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { title, breadcrumbs } from '$lib/stores/layout';
    import { base } from '$app/paths';

    let name: string = null,
        email: string = null,
        emailPassword: string = null,
        newPassword: string = null,
        oldPassword: string = null;
    // let showDelete = false;

    onMount(async () => {
        name ??= $user.name;
        email ??= $user.email;
    });

    const getAvatar = (name: string) => sdkForConsole.avatars.getInitials(name, 96, 96).toString();

    async function updateName() {
        try {
            await sdkForConsole.account.updateName(name);
            $user.name = name;
            title.set(name);
            const breadcrumb = $breadcrumbs.get(0);
            breadcrumb.title = name;
            $breadcrumbs = $breadcrumbs.set($breadcrumbs.size, breadcrumb);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateEmail() {
        try {
            await sdkForConsole.account.updateEmail(email, emailPassword);
            $user.email = email;
            addNotification({
                message: 'Email has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    async function updatePassword() {
        try {
            await sdkForConsole.account.updatePassword(newPassword, oldPassword);
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Container>
    <Form on:submit={updateName}>
        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autocomplete={false}
                        autofocus={true}
                        bind:value={name} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $user.name || !name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form on:submit={updateEmail}>
        <CardGrid>
            <h6 class="heading-level-7">Update Email</h6>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="email"
                        label="Email"
                        placeholder="Enter email"
                        autocomplete={false}
                        bind:value={email} />
                    <InputPassword
                        id="emailPassword"
                        label="Password"
                        placeholder="Enter password"
                        autocomplete={false}
                        showPasswordButton={true}
                        bind:value={emailPassword} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={email === $user.email || !email || !emailPassword} submit
                    >Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form on:submit={updatePassword}>
        <CardGrid>
            <h6 class="heading-level-7">Update Password</h6>
            <p class="text">
                Forgot your password? <a class="link" href={`${base}/recover`}
                    >Recover your password</a>
            </p>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputPassword
                        id="newPassword"
                        label="New password"
                        placeholder="Enter password"
                        autocomplete={false}
                        showPasswordButton={true}
                        bind:value={newPassword} />
                    <InputPassword
                        id="oldPassword"
                        label="Old password"
                        placeholder="Enter password"
                        autocomplete={false}
                        showPasswordButton={true}
                        bind:value={oldPassword} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!newPassword || !oldPassword} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <CardGrid>
        <div>
            <h6 class="heading-level-7">Delete Account</h6>
        </div>
        <p>
            Your account will be permanently deleted and access will be lost to any of your teams
            and data. This action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="image">
                    <Avatar size={48} name={$user.name} src={getAvatar($user.name)} />
                </svelte:fragment>
                <svelte:fragment slot="title">
                    <h6 class="u-bold">{$user.name}</h6>
                </svelte:fragment>
                <p>{$user.email}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => console.log('showDelete = true')}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>
