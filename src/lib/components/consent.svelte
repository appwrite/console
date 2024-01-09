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

    onMount(() => {
        if ($consent) {
            const date = new Date($consent.key);
            if (key > date) {
                show.set(true);
            }
        } else {
            show.set(true);
        }

        return consent.subscribe((value) => {
            selected = value.accepted;
        });
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

        <div class="u-flex u-margin-block-start-16 u-main-space-between u-cross-center">
            <div>
                <Button secondary on:click={() => settings.set(true)}>Cookie settings</Button>
            </div>
            <div class="u-flex u-gap-16">
                <Button on:click={rejectAll} secondary>Only required</Button>
                <Button on:click={acceptAll} secondary>Accept all</Button>
            </div>
        </div>
    </div>
{/if}

{#if $settings}
    <Modal bind:show={$settings} title="Cookie Preferences">
        <p>
            We use cookies to improve your site experience. The "strictly necessary" cookies are
            required for Appwrite to function.
        </p>
        <div class="u-width-full-line">
            <div class="collapsible-item">
                <div class="collapsible-wrapper">
                    <div class="collapsible-button">
                        <input type="checkbox" checked disabled />
                        <span class="text">Strictly Necessary Cookies</span>
                    </div>
                    <div class="collapsible-content">
                        <p class="text u-margin-block-start-8">
                            These are the cookies required for Appwrite to function.
                        </p>
                    </div>
                </div>
            </div>
            <div class="collapsible-item">
                <div class="collapsible-wrapper">
                    <div class="collapsible-button">
                        <input
                            id="analytics"
                            type="checkbox"
                            bind:checked={selected['analytics']} />
                        <label for="analytics" class="text">Product Analytics</label>
                        <span class="collapsible-button-optional">(optional)</span>
                    </div>
                    <div class="collapsible-content">
                        <p class="text u-margin-block-start-8">
                            We include analytics cookies to understand how you use our product and
                            design better experiences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <svelte:fragment slot="footer">
            <Button text external href="https://appwrite.io/privacy">Privacy Policy</Button>
            <Button on:click={() => confirmChoices(selected)}>Save preferences</Button>
        </svelte:fragment>
    </Modal>
{/if}

<style lang="scss">
    .card.is-consent {
        position: fixed;
        padding: 1.5rem;
        bottom: 1rem;
        right: 1rem;
        z-index: 100;
        max-width: 600px;
    }
</style>
