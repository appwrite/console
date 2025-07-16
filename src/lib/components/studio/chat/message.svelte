<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import Markdown, { type Plugin } from 'svelte-exmarkdown';
    import Li from './(markdown)/Li.svelte';
    import H1 from './(markdown)/H1.svelte';
    import H2 from './(markdown)/H2.svelte';
    import A from './(markdown)/A.svelte';
    import Strong from './(markdown)/Strong.svelte';
    import Em from './(markdown)/Em.svelte';
    import Ul from './(markdown)/Ul.svelte';
    import Ol from './(markdown)/Ol.svelte';
    import rehypeHighlight from 'rehype-highlight';
    import type { ImagineUIMessage, ImagineUIToolParts } from '$shared-types';
    import Thinking from './thinking.svelte';
    import Progress from './progress.svelte';
    import type { CheckpointUIDataPart } from '../../../../../ai-service/src/lib/ai/custom-parts/checkpoint';
    import Checkpoint from './checkpoint.svelte';

    type Props = {
        message: ImagineUIMessage;
        version: number | null;
        isLatestVersion: boolean;
    };
    let { message, version, isLatestVersion }: Props = $props();

    const plugins: Plugin[] = [
        {
            rehypePlugin: rehypeHighlight,
            renderer: {
                h1: H1,
                h2: H2,
                a: A,
                strong: Strong,
                em: Em,
                ul: Ul,
                ol: Ol,
                li: Li
            }
        }
    ];

    const organizedParts = $derived(() => {
        const nonTextParts = message.parts.filter(p => p.type !== 'text');
        const textParts = message.parts.filter(p => p.type === 'text');
        const finalText = textParts[textParts.length - 1];
        const toolCallParts = nonTextParts.filter(p => p.type.startsWith('tool-')) as ImagineUIToolParts[];
        const checkpointPart = nonTextParts.filter(p => p.type === 'data-checkpoint')[0] as CheckpointUIDataPart;
        
        return {
            nonTextParts,
            toolCallParts,
            finalText,
            checkpointPart,
        };
    });
</script>

<!-- User Message -->
{#if message.role === 'user'}
    {#each message.parts as part, partIndex (partIndex)}
        {#if part.type === 'text'}
            <div class="message">
                {part.text}
            </div>
        {/if}
    {/each}
{/if}

<!-- Assistant Messages -->
{#if message.role === 'assistant'}
    <!-- Non-text parts -->
    {#each organizedParts().nonTextParts as part, partIndex (partIndex)}
        {#if part.type === 'data-thinking'}
            <Thinking data={part.data} didReceiveFirstAsisstantTextChunk={part.data.text.length > 0} />
        {/if}
    {/each}
            
    <!-- Tool calls -->
    {#if organizedParts().toolCallParts.length > 0}
        <Progress version={version} isLatestVersion={isLatestVersion} toolCallParts={organizedParts().toolCallParts} />
    {/if}
    
    <!-- Final text -->
    {#if organizedParts().finalText}
        <Markdown md={organizedParts().finalText.text} {plugins} />
    {/if}

    <!-- Checkpoint -->
    {#if organizedParts().checkpointPart}
        <Checkpoint checkpointPart={organizedParts().checkpointPart.data} />
    {/if}
{/if}

<style lang="scss">
    .message {
        float: right;
        display: inline-flex;
        padding: 0.5rem;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 0.25rem;
        flex-shrink: 0;
        margin-inline-start: auto;
        border-radius: 0.5rem 0px 0.5rem 0.5rem;
        background: var(--bgcolor-neutral-default);
        box-shadow:
            0px 1.022px 4.089px 0px rgba(55, 59, 77, 0.1),
            0px 1.022px 4.089px -1.022px rgba(55, 59, 77, 0.1);
    }

    :global(.title) {
        margin-top: -2px;
        margin-left: -1px;
        width: calc(100% + 2px) !important;
    }

    .actions {
        padding: var(--space-6);
        position: relative;
        margin-left: var(--space-6);

        :global(.file) {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .icon {
            display: flex;
            align-items: center;
            margin-left: -18px;
            margin-right: 4px;
            background-color: var(--bgcolor-neutral-primary);
            flex: 0 0;
            position: relative;
            z-index: 10;
        }
    }

    .grid-line {
        position: absolute;
        inset: 0;
        width: 1px;
        background: linear-gradient(
            to bottom,
            transparent 0%,
            var(--border-neutral) 25%,
            var(--border-neutral) 75%,
            transparent 100%
        );
    }

    :global(pre) {
        margin: 0;
    }

    :global(pre code.hljs) {
        padding: 0;
    }
</style>
