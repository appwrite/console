<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import MfaChallengeFormList, { verify } from '$lib/components/mfaChallengeFormList.svelte';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications.js';

    export let data;

    const factors = data.factors as Models.MfaFactors & { recoveryCode: boolean };

    let disabled = false;
    let challenge: Models.MfaChallenge = null;
    let code = '';

    async function back() {
        await sdk.forConsole.account.deleteSession('current');
        await goto(base);
    }

    async function submit() {
        disabled = true;
        try {
            await verify(challenge, code);
            if ($page.url.searchParams) {
                const redirect = $page.url.searchParams.get('redirect');
                $page.url.searchParams.delete('redirect');
                if (redirect) {
                    await goto(`${redirect}${$page.url.search}`);
                } else {
                    await goto(`${base}/${$page.url.search ?? ''}`);
                }
            } else {
                await goto(base);
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            disabled = false;
        }
    }
</script>

<svelte:head>
    <title>Verify - Appwrite</title>
</svelte:head>

<Unauthenticated>
    <svelte:fragment slot="top">
        <div class="top u-flex u-position-absolute u-main-center">
            <div class="flex u-width-full-line">
                <Button text noMargin class="u-border-width-0" on:click={back}>
                    <span class="icon-cheveron-left u-font-size-20" aria-hidden="true" />
                    Back</Button>
            </div>
        </div>
    </svelte:fragment>
    <svelte:fragment slot="title">Verify your identity</svelte:fragment>
    <svelte:fragment>
        <Form onSubmit={submit} class="body-text-1">
            <MfaChallengeFormList {factors} bind:challenge bind:code bind:disabled />
        </Form>
    </svelte:fragment>
</Unauthenticated>

<style lang="scss">
    @use '@appwrite.io/pink/src/abstract/variables/devices';

    .top {
        inset-block-start: 5.85rem;
        inline-size: 100%;
        max-inline-size: 27.5rem;

        div {
            max-inline-size: 27.5rem;
        }
    }

    @media (max-width: 440px) {
        .top {
            inset-block-start: 0rem;
            padding-inline: 0.5rem;
        }
    }

    /* for smaller screens */
    @media #{devices.$break2open} {
        .top {
            inset-block-start: 5.85rem;
            padding-inline: 0;
        }
    }
</style>
