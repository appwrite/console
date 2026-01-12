<script lang="ts">
    import { Code } from '$lib/components';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { generateSDKCode } from '$lib/helpers/imageTransformations';
    import type { TransformationState } from '$lib/helpers/imageTransformations';

    let {
        transformationState,
        bucketId,
        fileId
    }: {
        transformationState: TransformationState;
        bucketId: string;
        fileId: string;
    } = $props();

    let selectedSDK = $state<'js' | 'python' | 'flutter' | 'swift' | 'kotlin'>('js');

    const code = $derived(generateSDKCode(transformationState, bucketId, fileId, selectedSDK));

    const sdkOptions = [
        { label: 'JavaScript', value: 'js' as const },
        { label: 'Python', value: 'python' as const },
        { label: 'Flutter', value: 'flutter' as const },
        { label: 'Swift', value: 'swift' as const },
        { label: 'Kotlin', value: 'kotlin' as const }
    ];

    const languageMap: Record<string, 'js' | 'python' | 'dart' | 'swift' | 'kotlin'> = {
        js: 'js',
        python: 'python',
        flutter: 'dart',
        swift: 'swift',
        kotlin: 'kotlin'
    };
</script>

<Layout.Stack gap="m">
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography.Text variant="m-500">Code</Typography.Text>
        <select
            class="sdk-selector"
            bind:value={selectedSDK}
            onchange={(e) => {
                selectedSDK = (e.target as HTMLSelectElement).value as typeof selectedSDK;
            }}>
            {#each sdkOptions as option}
                <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    </Layout.Stack>

    <div class="code-container">
        <Code {code} language={languageMap[selectedSDK]} withCopy withLineNumbers allowScroll />
    </div>
</Layout.Stack>

<style>
    .sdk-selector {
        padding: 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        background: var(--color-neutral-0);
        color: var(--color-neutral-100);
        font-size: var(--font-size-0);
    }

    .code-container {
        max-height: 500px;
        overflow-y: auto;
    }
</style>
