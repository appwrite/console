<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputDigits from '$lib/elements/forms/inputDigits.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showWebauthnDelete = false;

    let code: string;
    let error: string;
    let step = 1;

    async function deleteWebauthnAuthenticator() {
        if (step === 2) {
            try {
                await sdk.forConsole.webauthnAccount.deleteMfaWebauthnAuthenticator(null, null, code);
                await invalidate(Dependencies.ACCOUNT);
                await invalidate(Dependencies.FACTORS);
                showWebauthnDelete = false;
                addNotification({
                    type: 'success',
                    message: 'The authenticator has been removed'
                });
                trackEvent(Submit.AccountAuthenticatorDelete);
            } catch (e) {
                error = e.message;
                trackError(e, Submit.AccountAuthenticatorDelete);
            }
            return;
        }

        try {
            await sdk.forConsole.webauthnAccount.deleteMfaWebauthnAuthenticatorHelper();
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.FACTORS);
            showWebauthnDelete = false;
            addNotification({
                type: 'success',
                message: 'The authenticator has been removed'
            });
            trackEvent(Submit.AccountAuthenticatorDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AccountAuthenticatorDelete);
        }
    }

    $: if (showWebauthnDelete) {
        code = '';
        error = '';
    }
</script>

<Modal
    title="Delete authentication method"
    bind:show={showWebauthnDelete}
    onSubmit={deleteWebauthnAuthenticator}
    icon="exclamation"
    state="warning"
    bind:error
    headerDivider={false}>
    {#if step == 1}
    <p>Please authenticate with your Webauthn Device to finish deletion.</p>
    <section class="u-margin-inline-auto">
        <svg
            style="width: 10rem; opacity: 0.5;"
            class="u-margin-block-start-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 -1 158 160"
            stroke-width="0.5"
            stroke="currentColor">
            <g filter="url(#filter0_b_6_2371)">
                <circle
                    cx="78.871"
                    cy="78.871"
                    r="78.871"
                    transform="matrix(1 0 0 -1 0.257996 157.742)"
                    fill="url(#paint0_linear_6_2371)" />
                <circle
                    cx="78.871"
                    cy="78.871"
                    r="77.9758"
                    transform="matrix(1 0 0 -1 0.257996 157.742)"
                    stroke="url(#paint1_linear_6_2371)"
                    stroke-opacity="0.1"
                    stroke-width="1.79037" />
            </g>
            <mask id="path-3-inside-1_6_2371" fill="white">
                <path
                    d="M64.3407 63.801V52.8467C64.3407 49.2151 65.8987 45.7323 68.6721 43.1644C71.4454 40.5964 75.2069 39.1538 79.129 39.1538C83.0511 39.1538 86.8126 40.5964 89.5859 43.1644C92.3593 45.7323 93.9173 49.2151 93.9173 52.8467V63.801" />
            </mask>
            <path
                d="M64.3407 52.8467H61.6366H64.3407ZM67.0448 63.801V52.8467H61.6366V63.801H67.0448ZM67.0448 52.8467C67.0448 50.0024 68.2632 47.2283 70.5093 45.1486L66.8349 41.1802C63.5343 44.2363 61.6366 48.4278 61.6366 52.8467L67.0448 52.8467ZM70.5093 45.1486C72.7624 43.0624 75.8598 41.858 79.129 41.858V36.4497C74.554 36.4497 70.1285 38.1305 66.8349 41.1802L70.5093 45.1486ZM79.129 41.858C82.3982 41.858 85.4956 43.0624 87.7487 45.1486L91.4231 41.1802C88.1295 38.1305 83.704 36.4497 79.129 36.4497V41.858ZM87.7487 45.1486C89.9948 47.2283 91.2132 50.0024 91.2132 52.8467H96.6215C96.6215 48.4278 94.7238 44.2363 91.4231 41.1802L87.7487 45.1486ZM91.2132 52.8467V63.801H96.6215V52.8467H91.2132Z"
                fill="#E4E4E7"
                mask="url(#path-3-inside-1_6_2371)" />
            <path
                d="M52.2909 65.1529H105.967C109.159 65.1529 112.283 68.6256 112.283 73.6597V108.166C112.283 113.2 109.159 116.672 105.967 116.672H52.2909C49.0993 116.672 45.975 113.2 45.975 108.166V73.6597C45.975 68.6256 49.0993 65.1529 52.2909 65.1529Z"
                stroke="#E4E4E7"
                stroke-width="2.70415" />
            <mask id="path-6-inside-2_6_2371" fill="white">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M84.0794 92.5576C86.6596 90.918 88.3717 88.0344 88.3717 84.751C88.3717 79.6464 84.2336 75.5083 79.129 75.5083C74.0244 75.5083 69.8863 79.6464 69.8863 84.751C69.8863 88.0345 71.5985 90.9182 74.1788 92.5577L71.4269 106.317H86.8314L84.0794 92.5576Z" />
            </mask>
            <path
                d="M84.0794 92.5576L82.6291 90.2753L81.0641 91.2697L81.4278 93.0879L84.0794 92.5576ZM74.1788 92.5577L76.8305 93.088L77.1941 91.2698L75.6291 90.2754L74.1788 92.5577ZM71.4269 106.317L68.7752 105.787L68.1283 109.022H71.4269V106.317ZM86.8314 106.317V109.022H90.1299L89.483 105.787L86.8314 106.317ZM85.6675 84.751C85.6675 87.0709 84.4613 89.1109 82.6291 90.2753L85.5297 94.8399C88.8578 92.725 91.0758 88.998 91.0758 84.751H85.6675ZM79.129 78.2124C82.7401 78.2124 85.6675 81.1399 85.6675 84.751H91.0758C91.0758 78.1529 85.727 72.8042 79.129 72.8042V78.2124ZM72.5904 84.751C72.5904 81.1399 75.5178 78.2124 79.129 78.2124V72.8042C72.5309 72.8042 67.1821 78.1529 67.1821 84.751H72.5904ZM75.6291 90.2754C73.7967 89.111 72.5904 87.071 72.5904 84.751H67.1821C67.1821 88.9981 69.4003 92.7253 72.7286 94.8401L75.6291 90.2754ZM74.0785 106.848L76.8305 93.088L71.5272 92.0274L68.7752 105.787L74.0785 106.848ZM86.8314 103.613H71.4269V109.022H86.8314V103.613ZM81.4278 93.0879L84.1797 106.848L89.483 105.787L86.731 92.0272L81.4278 93.0879Z"
                fill="#E4E4E7"
                mask="url(#path-6-inside-2_6_2371)" />
            <defs>
                <filter
                    id="filter0_b_6_2371"
                    x="-35.5493"
                    y="-35.8073"
                    width="229.357"
                    height="229.357"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feGaussianBlur in="BackgroundImageFix" stdDeviation="17.9037" />
                    <feComposite
                        in2="SourceAlpha"
                        operator="in"
                        result="effect1_backgroundBlur_6_2371" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_backgroundBlur_6_2371"
                        result="shape" />
                </filter>
                <linearGradient
                    id="paint0_linear_6_2371"
                    x1="157.742"
                    y1="4.70108e-06"
                    x2="-4.32264e-06"
                    y2="153.986"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" stop-opacity="0.12" />
                    <stop offset="0.615652" stop-color="white" stop-opacity="0.04" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_6_2371"
                    x1="0"
                    y1="157.742"
                    x2="157.742"
                    y2="0"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" stop-opacity="0" />
                    <stop offset="1" stop-color="white" stop-opacity="0.54" />
                </linearGradient>
            </defs>
        </svg>
    </section>
    {:else if step == 2}
    <p>Enter your recovery code to finish deletion.</p>
    <FormList>
        <input
            type="text"
            class="input-text"
            placeholder="Enter your recovery code"
            bind:value={code} />
    </FormList>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showWebauthnDelete = false)}>Cancel</Button>
    
        {#if step == 1}
        <Button text on:click={() => (step = 2)}>Use a recovery code</Button>
        <Button secondary submit>Authenticate</Button>
        {:else if step == 2}
        <Button text on:click={() => (step = 1)}>Back</Button>
        <Button secondary submit>Delete</Button>
        {/if}
    </svelte:fragment>
</Modal>
