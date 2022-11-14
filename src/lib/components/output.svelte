<script lang="ts">
    import Copy from './copy.svelte';

    export let value: string;
</script>

<Copy {value}>
    <div class="interactive-text-output is-textarea">
        <span class="text u-line-height-1-5 u-break-all"><slot /></span>

        <div class="u-flex u-cross-child-start u-gap-8">
            <button class="interactive-text-output-button" aria-label="copy text">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </div>
    </div>
</Copy>
