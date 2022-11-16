<script lang="ts">
    import { base } from '$app/paths';
    import { Button, Form, FormItem, FormList, InputEmail } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { trackEvent } from '$lib/actions/analytics';

    let mail: string;
    const recover = async () => {
        try {
            await sdkForConsole.account.createRecovery(mail, window.location.hostname);
            addNotification({
                type: 'success',
                message: 'We have sent you an email with a password reset link'
            });
            trackEvent('submit_account_recover');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<svelte:head>
    <title>Recover - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Password Recovery</svelte:fragment>
    <svelte:fragment>
        <Form on:submit={recover}>
            <FormList>
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Email"
                    autofocus={true}
                    required={true}
                    bind:value={mail} />

                <FormItem>
                    <Button fullWidth submit>Recover</Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/login`}><span class="text">Sign in</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register`}><span class="text">Sign Up</span></a>
        </li>
    </svelte:fragment>
</Unauthenticated>
