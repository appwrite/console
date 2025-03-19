<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputPassword, InputText } from '$lib/elements/forms';
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
            await Promise.all([invalidate(Dependencies.ACCOUNT), invalidate(Dependencies.FACTORS)]);
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
        <svelte:fragment slot="title">Email</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                id="email"
                label="Email"
                placeholder="Enter email"
                bind:value={email}
                required />
            {#if email !== $user.email && email}
                <InputPassword
                    id="emailPassword"
                    label="Password"
                    placeholder="Enter password"
                    required
                    bind:value={emailPassword} />
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={email === $user.email || !email || !emailPassword} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
