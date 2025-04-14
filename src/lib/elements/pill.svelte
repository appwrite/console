<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    export let disabled = false;
    export let selected = false;
    export let success = false;
    export let warning = false;
    export let danger = false;
    export let info = false;
    export let button = false;
    export let submit = false;
    export let external = false;
    export let href: string = null;
    export let event: string = null;
    export let eventData: Record<string, unknown> = {};
    export let style = '';
    let classes = '';
    export { classes as class };

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'tag',
            ...eventData
        });
    }
</script>

{#if href}
    <a
        {style}
        {href}
        target={external ? '_blank' : '_self'}
        rel={external ? 'noopener noreferrer' : ''}
        class="tag {classes}"
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </a>
{:else if button}
    <button
        on:click
        on:click={track}
        {style}
        {disabled}
        type={submit ? 'submit' : 'button'}
        class="tag {classes}"
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </button>
{:else}
    <div
        class="tag {classes}"
        {style}
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </div>
{/if}

<style>
    /* button and anchor tags seem to have special dimens, this should be auto fixed in pink2. */
    :global(.tag):where(button, a) {
        --p-tag-height: 2.125rem;
        --p-tag-content-height: 2.024rem;
    }
</style>
