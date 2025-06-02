<script lang="ts">
    import { queue } from '$lib/components/studio/chat/queue.svelte.js';
    import { studio } from '$lib/components/studio/studio.svelte.js';
    import { conversation } from '$lib/stores/chat';
    import { Accordion, Button, Code, Typography } from '@appwrite.io/pink-svelte';

    type Props = {
        show: boolean;
    };
    let { show = $bindable() }: Props = $props();
</script>

{#if show}
    <div>
        <span>
            <Button.Button variant="primary" on:click={() => (show = false)}>close</Button.Button>
        </span>
        <Accordion title="Studio" open>
            <section>
                <Code hideHeader lang="json" code={JSON.stringify({ studio }, undefined, 2)}></Code>
            </section>
        </Accordion>
        <Accordion title="Queue">
            <section>
                <Code
                    hideHeader
                    lang="json"
                    code={JSON.stringify({ queue, lists: queue.lists }, undefined, 2)}></Code>
            </section>
        </Accordion>
        <Accordion title="Conversation">
            <section>
                <Code
                    hideHeader
                    lang="json"
                    code={JSON.stringify({ conversation: $conversation }, undefined, 2)}></Code>
            </section>
        </Accordion>
    </div>
{/if}

<style>
    div {
        height: 100vh;
        width: 100vw;
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9999;
        background: white;
        display: flex;
        flex-direction: column;
        overflow: scroll;
    }
    section {
        max-height: 80vh;
        overflow: scroll;
    }
</style>
