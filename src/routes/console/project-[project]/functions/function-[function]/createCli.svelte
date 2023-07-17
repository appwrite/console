<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal, Collapsible, CollapsibleItem, Code } from '$lib/components';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { func } from './store';

    export let show = false;

    let lang = 'js';
    let codeSnippets = {};
    let os = 'unknown';

    const functionId = $page.params.function;

    onMount(() => {
        lang = setLanguage($func.runtime);
        codeSnippets = setCodeSnippets(lang);
        os = navigator['userAgentData']?.platform || navigator?.platform || 'unknown';
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

    function openCategory(category: string, index: number) {
        switch (category) {
            case 'CMD':
                return os.includes('Win');
            case 'PowerShell':
                return os.includes('Win');
            case 'Unix':
                return (
                    os === 'unknown' || os.includes('Linux') || os.includes('Mac') || index === 0
                );
            default:
                return index === 0;
        }
    }
</script>

<Modal size="big" bind:show>
    <svelte:fragment slot="header">Create Deployment</svelte:fragment>
    <p class="text">
        You can deploy your function from the Appwrite CLI using Unix, CMD, or PowerShell. Check out
        our Documentation to learn more about <a
            href="https://appwrite.io/docs/functions#deployFunction"
            target="_blank"
            rel="noopener noreferrer"
            class="link">deploying your functions</a
        >, or how to install and use the
        <a
            href="https://appwrite.io/docs/command-line"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Appwrite CLI</a
        >.
    </p>
    <Collapsible>
        {#each ['Unix', 'CMD', 'PowerShell'] as category, i}
            <CollapsibleItem open={openCategory(category, i)}>
                <svelte:fragment slot="title">{category}</svelte:fragment>
                <Code
                    withLineNumbers
                    withCopy
                    language="sh"
                    label={codeSnippets[category].language}
                    code={codeSnippets[category].code} />
            </CollapsibleItem>
        {/each}
    </Collapsible>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
