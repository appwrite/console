<script lang="ts">
    import { app } from '$lib/stores/app';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';
    import Heading from '$lib/components/heading.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { base } from '$app/paths';

    /**
     * Redirect to OAuth2 screen -> Get token -> Create service account -> Get Projects -> Request user to select project -> Create destination
     */

    let stage = 0;

    function track() {
        console.log('test');
    }
</script>

<div>
    <article class="card u-grid u-cross-center u-width-full-line common-section">
        <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
            <button
                type="button"
                on:click|preventDefault
                on:click={track}
                aria-label={`Login with google`}>
                <div class="grid-box u-flex">
                    <div class="image-item">
                        <img
                            width="200"
                            height="200"
                            src={`${base}/icons/${$app.themeInUse}/color/firebase.svg`}
                            alt="technology" />
                    </div>
                    <span class="icon-arrow-right" style="align-self: center;" />
                    <div class="image-item">
                        <img
                            width="200"
                            height="200"
                            src={`${base}/icons/${$app.themeInUse}/color/appwrite.svg`}
                            alt="technology" />
                    </div>
                </div>
            </button>
            <slot>
                <div class="u-text-center">
                    <Heading size="7" tag="h2">Login with google to get started.</Heading>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button secondary on:click on:click={track}>Login with Google</Button>
                </div>
            </slot>
        </div>
    </article>
</div>
