<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Unauthenticated } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import MfaChallengeFormList, { verify } from '$lib/components/mfaChallengeFormList.svelte';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications.js';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';

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
            if (page.url.searchParams) {
                const redirect = page.url.searchParams.get('redirect');
                page.url.searchParams.delete('redirect');
                if (redirect) {
                    await goto(`${redirect}${page.url.search}`);
                } else {
                    await goto(`${base}/${page.url.search ?? ''}`);
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

<Unauthenticated align="center">
    <svelte:fragment slot="top">
        <div class="top u-flex u-position-absolute u-main-center">
            <div class="flex u-width-full-line">
                <Button compact on:click={back}>
                    <Icon icon={IconChevronLeft} slot="start" size="s" />
                    Back
                </Button>
            </div>
        </div>
    </svelte:fragment>
    <svelte:fragment slot="title">Verify your identity</svelte:fragment>
    <Form onSubmit={submit}>
        <Layout.Stack gap="l" justifyContent="center" alignContent="center" alignItems="center">
            <MfaChallengeFormList {factors} bind:challenge bind:code bind:disabled />
        </Layout.Stack>
    </Form>
</Unauthenticated>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

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
            inset-block-start: 1rem;
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
