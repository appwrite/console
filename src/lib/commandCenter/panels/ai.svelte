<script lang="ts">
    import { slide } from 'svelte/transition';
    import Template from './template.svelte';

    import { useCompletion } from 'ai/svelte';

    const { input, handleSubmit, completion, isLoading } = useCompletion({
        api: 'http://localhost:3003/'
    });
</script>

<Template --command-panel-width="600px">
    <form
        class="input-text-wrapper u-width-full-line"
        style="--amount-of-buttons: 1;"
        slot="search"
        on:submit|preventDefault={handleSubmit}>
        <input
            type="text"
            class="input-text"
            autofocus
            placeholder="Ask AI..."
            bind:value={$input}
            disabled={$isLoading} />
        <div class="options-list">
            {#if $isLoading}
                <div class="loader" />
            {:else}
                <button
                    class="options-list-button"
                    aria-label="ask AI"
                    type="submit"
                    disabled={!$input.trim() || $isLoading}>
                    <span class="icon-arrow-sm-right" aria-hidden="true" />
                </button>
            {/if}
        </div>
    </form>
    {#if $completion}
        <div class="answer" transition:slide|local={{ duration: 250 }}>
            {$completion}
        </div>
    {/if}
</Template>

<style lang="scss">
    input {
        border: none;
        background: transparent;
    }

    .options-list {
        align-items: center;
    }

    .options-list-button span {
        position: relative;
        top: -1px;
    }

    .loader {
        width: 1rem;
        height: 1rem;
    }

    .answer {
        margin-block-start: 1rem;
        padding-inline: 0.5rem;
        padding-block-end: 1rem;

        max-height: 55rem;
        overflow-y: auto;

        p {
            white-space: pre-wrap;
        }

        .code :global(pre) {
            translate: 0 -1rem;
        }
    }
</style>
