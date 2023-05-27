<script lang="ts">
    import { Copy } from '.';

    export let show = false;
    export let value: string;
</script>

<div class="interactive-text-output" class:is-textarea={show} data-private>
    {#if show}
        <span class="text u-line-height-1-5 u-break-all">{value}</span>
    {:else}
        <span class="text">••••••••••••</span>
    {/if}
    <div class="u-flex u-cross-child-start u-gap-8">
        <button
            class="interactive-text-output-button"
            aria-label="show hidden text"
            type="button"
            on:click={() => (show = !show)}>
            <span class:icon-eye-off={show} class:icon-eye={!show} aria-hidden="true" />
        </button>
        <Copy {value}>
            <button class="interactive-text-output-button" aria-label="copy text" type="button">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </Copy>
    </div>
</div>
