<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        Button,
        Form,
        InputChoice,
        InputEmail,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import LoginLight from '$lib/images/login/login-light-mode.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.svg';
    import { isCloud } from '$lib/system';
    import { Layout } from '@appwrite.io/pink-svelte';

    let slug = page.params.slug;
    let imgLight = LoginLight;
    let imgDark = LoginDark;

    onMount(async () => {
        if (isCloud) {
            code = slug;
            switch (slug) {
                case 'mlh':
                    imgDark = (await import('./mlh-dark.svg')).default;
                    imgLight = (await import('./mlh-light.svg')).default;
                    title = 'Welcome MLH Hackers!';
                    break;
                case 'appwrite':
                    imgDark = (await import('$lib/images/appwrite.svg')).default;
                    imgLight = (await import('$lib/images/appwrite.svg')).default;
                    title = 'Welcome Appwriters!';
                    break;
                case 'cloud_beta':
                    break;
                default:
                    code = '';
            }
        }
    });

    let name: string, mail: string, pass: string, code: string;
    let title = 'Sign up';
    let terms = false;

    async function invite() {
        try {
            const { endpoint, project } = sdk.forConsole.client.config;
            const res = await fetch(`${endpoint}/account/invite`, {
                method: 'POST',
                headers: {
                    'X-Appwrite-Project': project,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'unique()',
                    email: mail,
                    password: pass,
                    code: code,
                    name: name ?? ''
                })
            });
            if (!res.ok) {
                throw new Error((await res.json()).message);
            } else {
                await sdk.forConsole.account.createEmailPasswordSession(mail, pass);
                const prefs = await sdk.forConsole.account.getPrefs();
                const newPrefs = { ...prefs, code };
                await sdk.forConsole.account.updatePrefs(newPrefs);
                await invalidate(Dependencies.ACCOUNT);
                await goto(base);
                trackEvent('submit_account_create', { code: code });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<svelte:head>
    <title>Sign up - Appwrite</title>
</svelte:head>

<Unauthenticated {imgLight} {imgDark}>
    <svelte:fragment slot="title">{title}</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={invite}>
            <Layout.Stack>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Your name"
                    autofocus={true}
                    bind:value={name} />
                <InputEmail
                    id="email"
                    label="Email"
                    placeholder="Your email"
                    required={true}
                    bind:value={mail} />
                <InputPassword
                    id="password"
                    label="Password"
                    placeholder="Your password"
                    required={true}
                    bind:value={pass} />
                <InputText
                    id="Code"
                    label="Code"
                    placeholder="Your code"
                    required={true}
                    bind:value={code} />
                <InputChoice required value={terms} id="terms" label="terms" showLabel={false}>
                    By registering, you agree that you have read, understand, and acknowledge our <a
                        class="link"
                        href="https://appwrite.io/privacy"
                        target="_blank"
                        rel="noopener noreferrer">
                        Privacy Policy</a>
                    and accept our
                    <a
                        class="link"
                        href="https://appwrite.io/terms"
                        target="_blank"
                        rel="noopener noreferrer">General Terms of Use</a
                    >.</InputChoice>
                <Button fullWidth submit>Sign up</Button>
            </Layout.Stack>
        </Form>
    </svelte:fragment>
    <svelte:fragment slot="links">
        <li class="inline-links-item">
            <span class="text">
                Already got an account? <a class="link" href={`${base}/login`}>Sign in</a>
            </span>
        </li>
    </svelte:fragment>
</Unauthenticated>
