<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Empty, Card } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';

    export let single = false;
    export let isCard = true;
    export let noMedia = false;
    export let target: string = null;
    export let href: string = null;
    export let marginTop = false;
    export let allowCreate = true;

    function track() {
        if (!allowCreate) {
            return;
        }
        if (target) {
            trackEvent(`click_create_${target}`, {
                from: 'empty'
            });
        }
    }
</script>

{#if single}
    <Card.Base padding="none">
        <Empty
            title={`Create your first ${target}`}
            description="Need a hand? Learn more in our documentation.">
            <svelte:fragment slot="actions">
                <Button
                    external
                    {href}
                    text
                    event="empty_documentation"
                    size="small"
                    ariaLabel="create {target}">Documentation</Button>
                <Button secondary on:mousedown on:click on:click={track} disabled={!allowCreate} size="small">
                    Create {target}
                </Button>
            </svelte:fragment>
        </Empty>
    </Card.Base>
{:else}
    <button
        on:click|preventDefault
        on:click={track}
        aria-label="create"
        type="button"
        class:card={isCard}
        class="u-grid u-cross-center u-width-full-line dashed"
        class:common-section={marginTop}>
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <div class="common-section">
                <div class="button is-secondary is-only-icon">
                    <i class="icon-plus" />
                </div>
            </div>
            <div class="common-section">
                <slot />
            </div>
        </div>
    </button>
{/if}
