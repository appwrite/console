<script lang="ts">
    export let submit = false;
    export let secondary = false;
    export let tertiary = false;
    export let text = false;
    export let danger = false;
    export let disabled = false;
    export let round = false;
    export let href: string = null;
    export let external = false;
    //TODO: add option to add aria-label to buttons that are only icons
</script>

{#if href}
    <a
        {disabled}
        {href}
        target={external ? '_blank' : '_self'}
        rel={external ? 'noopener noreferrer' : ''}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-tertiary={tertiary}
        class:is-text={text}
        class:is-danger={danger}>
        <slot />
    </a>
{:else}
    <button
        on:click
        {disabled}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-tertiary={tertiary}
        class:is-danger={danger}
        class:is-text={text}
        type={submit ? 'submit' : 'button'}>
        <slot />
    </button>
{/if}
