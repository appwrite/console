<script lang="ts">
    import { goto } from '$app/navigation';
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
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import AppwriteLogo from '$lib/images/appwrite.svg';
    import LoginLight from '$lib/images/login/login-light-mode.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.svg';

    let mail: string, pass: string;

    const login = async () => {
        try {
            await sdkForConsole.account.createEmailSession(mail, pass);
            user.fetchUser();
            addNotification({
                type: 'success',
                message: 'Successfully logged in.'
            });
            await goto(`${base}/console`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    const technologies = [
        'js',
        'flutter',
        'apple',
        'android',
        'node_js',
        'php',
        'python',
        'ruby',
        'dart',
        'kotlin',
        'swift'
    ];
</script>

<svelte:head>
    <title>Appwrite - Sign in</title>
</svelte:head>

<main class="grid-1-1 is-full-page" id="main">
    <section class="grid-1-1-col-1 u-flex u-flex-vertical">
        <div
            class="container u-margin-block-start-40"
            style="--p-container-max-size: var(--container-size-medium);">
            <a href="/">
                <img src={AppwriteLogo} width="196" height="47" class="u-block" alt="Appwrite" />
            </a>
        </div>

        <div class="u-margin-block-start-auto" />

        <div
            class="container u-margin-block-start-20"
            style="--p-container-max-size: var(--container-size-large);">
            <img src={LoginLight} alt="" class="u-only-light" />
            <img src={LoginDark} alt="" class="u-only-dark" />
        </div>

        <div class="u-margin-block-start-auto" />

        <div
            class="container u-text-color-light-gray"
            style="--p-container-max-size:var(--container-size-small); --p-container-padding-inline:1rem;">
            <p>Integrate with your favourite technologies</p>
            <ul
                class="u-flex u-main-center u-flex-wrap u-gap-16 u-margin-block-start-32 u-line-height-1">
                {#each technologies as tech}
                    <li>
                        <span
                            class={`icon-${tech} u-font-size-32`}
                            aria-hidden="true"
                            aria-label={tech} />
                    </li>
                {/each}
            </ul>
        </div>
        <div class="u-margin-block-start-40" />
    </section>
    <section class="grid-1-1-col-2 u-flex u-main-center u-cross-center">
        <div class="container u-flex u-flex-vertical u-cross-center">
            <div class="u-margin-block-start-auto" />

            <div class="u-max-width-500 u-width-full-line">
                <h1 class="heading-level-3 u-margin-block-start-auto">Sign In</h1>
                <div class="u-margin-block-start-40">
                    <Form on:submit={login}>
                        <FormList>
                            <InputEmail
                                id="email"
                                label="Email"
                                placeholder="Email"
                                showLabel={false}
                                autofocus={true}
                                required={true}
                                bind:value={mail} />
                            <InputPassword
                                id="password"
                                label="Password"
                                placeholder="Password"
                                showLabel={false}
                                required={true}
                                meter={false}
                                bind:value={pass} />
                            <FormItem>
                                <Button fullWidth submit>Sign in</Button>
                            </FormItem>
                        </FormList>
                    </Form>
                </div>

                <ul class="inline-links is-center is-with-sep u-margin-block-start-32">
                    <li class="inline-links-item">
                        <a href="#/"><span class="text">Forgot Password?</span></a>
                    </li>
                    <li class="inline-links-item">
                        <a href={`${base}/register`}><span class="text">Sign Up</span></a>
                    </li>
                </ul>
            </div>

            <div class="u-margin-block-start-auto" />
            <p class="u-max-width-500 u-width-full-line u-margin-block-start-24">
                version 0.15.2.402
            </p>
            <div class="u-margin-block-start-40" />
        </div>
    </section>
</main>
