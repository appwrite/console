<script lang="ts">
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { Button, InputTextarea } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Layout, Icon } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    let {
        show = $bindable(false),
        onGenerate
    }: {
        show: boolean;
        onGenerate: (embeddings: number[]) => void;
    } = $props();

    let content = $state('');
    let generating = $state(false);

    const MAX_LENGTH = 25000;

    async function generate() {
        if (!content.trim()) return;

        generating = true;
        try {
            const client = sdk.forProject(page.params.region, page.params.project).client;
            const uri = new URL(client.config.endpoint + '/vectorsdb/embeddings/text');
            const response = await client.call(
                'post',
                uri,
                { 'content-type': 'application/json' },
                { texts: [content.trim()] }
            );

            const embedding = response?.embeddings?.[0]?.embedding;
            if (embedding?.length) {
                onGenerate(embedding);
                content = '';
                show = false;
            } else {
                const error = response?.embeddings?.[0]?.error;
                throw new Error(error || 'Failed to generate embeddings');
            }
        } catch (e) {
            addNotification({ type: 'error', message: e instanceof Error ? e.message : String(e) });
        } finally {
            generating = false;
        }
    }

    $effect(() => {
        if (!show) {
            content = '';
        }
    });
</script>

<Modal size="m" bind:show title="Text for embedding" onSubmit={generate}>
    <p class="u-margin-block-end-8">
        Enter the content you want to convert into a vector. This will allow semantic search and
        similarity matching.
    </p>

    <InputTextarea
        id="embedding-content"
        label="Content to embed"
        placeholder="Paste or type your text here..."
        bind:value={content}
        maxlength={MAX_LENGTH}
        autofocus
        required />

    <Layout.Stack direction="row" gap="xs" alignItems="center">
        <Icon icon={IconInfo} size="s" />
        <span class="u-color-text-offline"
            >Embeddings are generated using Embedding Gemma model</span>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary disabled={generating} on:click={() => (show = false)}>Cancel</Button>
        <Button
            submit
            disabled={generating || !content.trim()}
            submissionLoader
            forceShowLoader={generating}>Generate</Button>
    </svelte:fragment>
</Modal>
