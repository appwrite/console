<script lang="ts">
    import { truncate as truncateAction } from '$lib/actions/truncate';
    import Copy from './copy.svelte';

    export let value: string;
    export let truncate = false;
</script>

<Copy {value}>
    <div class="interactive-text-output is-textarea">
        <span
            class="text u-line-height-1-5 u-break-all"
            use:truncateAction={{ n: 8, enabled: truncate }}><slot /></span>

        <div class="u-flex u-cross-child-start u-gap-8">
            <button class="interactive-text-output-button" aria-label="copy text">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </div>
    </div>
</Copy>
