<script lang="ts">
    import Copy from './copy.svelte';

    export let value: string;
    export let hideCopyIcon = false;
</script>

<Copy {value}>
    <div
        class="interactive-text-output is-textarea"
        style:min-inline-size="0"
        style:display="inline-block">
        <span class="text u-line-height-1-5 u-break-all"><slot /></span>
        {#if !hideCopyIcon}
            <div class="u-flex u-cross-child-start u-gap-8">
                <button class="interactive-text-output-button" aria-label="copy text">
                    <span class="icon-duplicate" aria-hidden="true"></span>
                </button>
            </div>
        {/if}
    </div>
</Copy>
