<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputPassword, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';

    let email: string = null;
    let emailPassword: string = null;

    onMount(async () => {
        email ??= $user.email;
    });

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
</script>

<Form onSubmit={updateEmail}>
    <CardGrid>
        <Heading tag="h6" size="7">Email</Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputText id="email" label="Email" placeholder="Enter email" bind:value={email} />
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
            <Button disabled={email === $user.email || !email || !emailPassword} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
