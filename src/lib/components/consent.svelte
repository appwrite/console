<script lang="ts" context="module">
    type Consent = {
        key: string;
        accepted: Record<string, boolean>;
    };
    export const settings = writable<boolean>(false);
    export const show = writable<boolean>(false);
    export const consent = writable<Consent>(
        JSON.parse(globalThis?.localStorage?.getItem('consent') ?? null)
    );
    consent.subscribe((value) => {
        if (browser) {
            globalThis.localStorage.setItem('consent', JSON.stringify(value));
        }
    });
</script>

<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { Modal } from '.';
    import { Button } from '$lib/elements/forms';
    import { writable } from 'svelte/store';
    import { browser } from '$app/environment';

    const key = new Date('2023-11-07');
    const dispatch = createEventDispatcher();

    let selected = {};

    $: if ($settings) {
        selected = $consent?.accepted ?? {};
    }

    onMount(() => {
        if ($consent) {
            const date = new Date($consent.key);
            if (key > date) {
                show.set(true);
            }
        } else {
            show.set(true);
        }
    });

    function saveSettings(obj: Consent) {
        consent.set(obj);
    }

    function confirmChoices(choices: Consent['accepted']) {
        const consent = {
            key: key.toISOString(),
            accepted: choices
        };
        saveSettings(consent);
        dispatch('confirm', consent);
        show.set(false);
        settings.set(false);
    }

    function acceptAll() {
        confirmChoices({
            analytics: true
        });
    }

    function rejectAll() {
        confirmChoices({});
    }
</script>

{#if $show}
    <div class="card is-consent">
        <p>
            By clicking "Accept all", you agree to the storing of cookies on your device to analyze
            site usage.
        </p>

        <div
            class="is-consent-buttons u-flex u-margin-block-start-16 u-main-space-between u-cross-center">
            <Button class="u-padding-inline-0" text on:click={() => settings.set(true)}>
                Cookie settings
            </Button>
            <div class="u-flex u-gap-16">
                <Button secondary on:click={rejectAll}>Only required</Button>
                <Button secondary on:click={acceptAll}>Accept all</Button>
            </div>
        </div>
    </div>
{/if}

<Modal bind:show={$settings} title="Cookie Preferences">
    <p>
        We use cookies to improve your site experience. The "strictly necessary" cookies are
        required for Appwrite to function.
    </p>
    <div class="u-flex-vertical u-gap-24 u-width-full-line" style:margin-block-end="24px">
        <div class="u-flex u-gap-8">
            <input type="checkbox" checked disabled />
            <div>
                <span class="text u-bold">Strictly necessary cookies</span>
                <p class="text u-margin-block-start-8">
                    These are the cookies required for Appwrite to function.
                </p>
            </div>
        </div>
        <div class="u-flex u-gap-8">
            <input id="analytics" type="checkbox" bind:checked={selected['analytics']} />
            <div>
                <label for="analytics" class="text u-bold">Product analytics</label>
                <span class="">(optional)</span>
                <p class="text u-margin-block-start-8">
                    We include analytics cookies to understand how you use our product and design
                    better experiences.
                </p>
            </div>
        </div>
    </div>
    <svelte:fragment slot="footer">
        <Button text external href="https://appwrite.io/privacy">Privacy Policy</Button>
        <Button on:click={() => confirmChoices(selected)}>Save preferences</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    .card {
        position: fixed;
        padding: 1.5rem;
        bottom: 1rem;
        right: 1rem;
        z-index: 100;
        max-width: 600px;
    }

    @media #{devices.$break1} {
        .card {
            bottom: 0.5rem;
            left: 0.5rem;
            right: 0.5rem;
            max-width: 100%;

            .is-consent-buttons {
                flex-direction: column;
                align-items: center;
            }
        }
    }
</style>
