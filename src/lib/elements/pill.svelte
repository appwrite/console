<script lang="ts">
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
</script>

{#if href}
    <a
        {href}
        target={external ? '_blank' : '_self'}
        rel={external ? 'noopener noreferrer' : ''}
        class="tag"
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
        {disabled}
        type={submit ? 'submit' : 'button'}
        class="tag"
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
        class="tag"
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </div>
{/if}
