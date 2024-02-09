<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form, FormItem, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { AuthenticatorProvider } from '@appwrite.io/console';

    let code: string, disabled: boolean;

    async function verify() {
        try {
            disabled = true;
            const challenge = await sdk.forConsole.account.createChallenge(AuthenticatorProvider.Totp);
            await sdk.forConsole.account.updateChallenge(challenge.$id, code);
            await invalidate(Dependencies.ACCOUNT);
            trackEvent(Submit.AccountCreate);
            if ($page.url.searchParams) {
                const redirect = $page.url.searchParams.get('redirect');
                $page.url.searchParams.delete('redirect');
                if (redirect) {
                    await goto(`${base}${redirect}${$page.url.search}`);
                } else {
                    await goto(`${base}/console${$page.url.search ?? ''}`);
                }
            } else {
                await goto(`${base}/console`);
            }
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
    <title>Verify - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="title">Verify your identity</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={verify}>
            <FormList>
                <InputText
                    id="code"
                    bind:value={code}
                    label="One-time code"
                    placeholder="Enter one-time code"
                    required
                    autofocus />
                <FormItem>
                    <Button fullWidth submit {disabled}>Verify</Button>
                </FormItem>
            </FormList>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <a href={`${base}/recover`}><span class="text">Forgot Password?</span></a>
        </li>
        <li class="inline-links-item">
            <a href={`${base}/register${$page?.url?.search ?? ''}`}>
                <span class="text">Sign Up</span>
            </a>
        </li>
    </svelte:fragment>
</Unauthenticated>
