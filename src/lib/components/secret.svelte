<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { Copy } from '.';

    export let show = false;
    export let value: string;
    export let copyEvent: string = null;
</script>

<div class="interactive-text-output" class:is-textarea={show}>
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
            on:click={() => {
                show = !show;
                trackEvent(`click_secret_${show ? 'show' : 'hide'}`);
            }}
            use:tooltip={{ content: show ? 'Hide secret' : 'Show secret', hideOnClick: false }}>
            <span class:icon-eye-off={show} class:icon-eye={!show} aria-hidden="true" />
        </button>
        <Copy {value} event={copyEvent} eventContext="click_secret_copy">
            <button class="interactive-text-output-button" aria-label="copy text" type="button">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </Copy>
    </div>
</div>
