<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal, Code } from '$lib/components';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { func } from '../store';
    import SecondaryTabs from '$lib/components/secondaryTabs.svelte';
    import SecondaryTabsItem from '$lib/components/secondaryTabsItem.svelte';
    import { Alert } from '@appwrite.io/pink-svelte';

    export let show = false;

    let lang = 'js';
    let codeSnippets = {};
    let os = 'unknown';
    let category = 'Unix';

    const functionId = $page.params.function;

    onMount(() => {
        lang = setLanguage($func.runtime);
        codeSnippets = setCodeSnippets(lang);
        os = navigator['userAgentData']?.platform || navigator?.platform || 'unknown';

        if (os.includes('Win')) {
            category = 'CMD';
        } else if (os.includes('Mac') || os.includes('Linux')) {
            category = 'Unix';
        } else {
            category = 'Unix';
        }
    });

    function setLanguage(runtime: string) {
        if (runtime.includes('node') || runtime.includes('deno')) {
            return 'js';
        } else if (runtime.includes('php')) {
            return 'php';
        } else if (runtime.includes('python')) {
            return 'py';
        } else if (runtime.includes('dart')) {
            return 'dart';
        } else if (runtime.includes('dotnet')) {
            return 'cs';
        } else if (runtime.includes('ruby')) {
            return 'rb';
        } else if (runtime.includes('swift')) {
            return 'swift';
        } else if (runtime.includes('kotlin')) {
            return 'kt';
        } else if (runtime.includes('java')) {
            return 'java';
        }
    }

    function setCodeSnippets(lang: string) {
        return {
            Unix: {
                code: `appwrite functions createDeployment \\
    --functionId=${functionId} \\
    --entrypoint='index.${lang}' \\
    --code="." \\
    --activate=true`,
                language: 'bash'
            },

            CMD: {
                code: `appwrite functions createDeployment ^
    --functionId=${functionId} ^
    --entrypoint='index.${lang}' ^
    --code="." ^
    --activate=true`,
                language: 'CMD'
            },
            PowerShell: {
                code: `appwrite functions createDeployment ,
    --functionId=${functionId} ,
    --entrypoint='index.${lang}' ,
    --code="." ,
    --activate=true`,
                language: 'PowerShell'
            }
        };
    }
</script>

<Modal title="Create CLI deployment" bind:show>
    <p class="text">
        Deploy your function using the Appwrite CLI by running the following command inside your
        function's folder.
    </p>

    <Alert.Inline dismissible={false} status="warning">
        If you did not create your function using the CLI, initialize your function by following our <a
            href="https://appwrite.io/docs/tooling/command-line/installation"
            target="_blank"
            rel="noopener noreferrer"
            class="link">documentation</a
        >.
    </Alert.Inline>

    <div class="editor-border box">
        <SecondaryTabs large class="u-sep-block-end u-padding-8">
            {#each ['Unix', 'CMD', 'PowerShell'] as cat}
                <SecondaryTabsItem
                    stretch
                    fullWidth
                    center
                    on:click={() => (category = cat)}
                    disabled={category === cat}>
                    {cat}
                </SecondaryTabsItem>
            {/each}
        </SecondaryTabs>

        {#each ['Unix', 'CMD', 'PowerShell'] as cat}
            {#if category === cat}
                <Code
                    withLineNumbers
                    withCopy
                    language="sh"
                    class="cli-commands-code-box-no-outline"
                    label={codeSnippets[cat].language}
                    code={codeSnippets[cat].code} />
            {/if}
        {/each}
    </div>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>

<style>
    .box {
        padding: unset;
        background-color: unset;
    }

    .editor-border :global(.cli-commands-code-box-no-outline) {
        margin: 1rem 0;
        border: unset;
        border-radius: unset;
        background-color: unset;
        padding: 0 var(--box-padding, 1.5rem) 0 var(--box-padding, 1.5rem);
    }

    :global(.editor-border .cli-commands-code-box-no-outline pre) {
        background-color: unset;
    }
</style>
