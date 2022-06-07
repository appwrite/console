<script lang="ts">
    export let submit = false;
    export let secondary = false;
    export let outline = false;
    export let danger = false;
    export let disabled = false;
    export let round = false;
    export let href: string = null;
</script>

{#if href}
    <a
        {disabled}
        {href}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-outline={outline}
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
        class:is-outline={outline}
        class:is-danger={danger}
        type={submit ? 'submit' : 'button'}>
        <slot />
    </button>
{/if}
