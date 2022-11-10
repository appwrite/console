<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    export let submit = false;
    export let secondary = false;
    export let text = false;
    export let danger = false;
    export let disabled = false;
    export let round = false;
    export let external = false;
    export let href: string = null;
    export let fullWidth = false;
    export let ariaLabel: string = null;
    export let noMargin = false;
    export let event: string = null;

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'button'
        });
    }
</script>

{#if href}
    <a
        on:click={track}
        {disabled}
        {href}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-text={text}
        class:is-danger={danger}
        class:is-full-width={fullWidth}
        class:u-padding-inline-0={noMargin}
        aria-label={ariaLabel}>
        <slot />
    </a>
{:else}
    <button
        on:click
        on:click={track}
        {disabled}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-danger={danger}
        class:is-text={text}
        class:is-full-width={fullWidth}
        class:u-padding-inline-0={noMargin}
        type={submit ? 'submit' : 'button'}
        aria-label={ariaLabel}>
        <slot />
    </button>
{/if}
