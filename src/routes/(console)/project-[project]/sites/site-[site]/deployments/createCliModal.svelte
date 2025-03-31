<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal, Alert } from '$lib/components';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Code, Layout, Tabs } from '@appwrite.io/pink-svelte';

    export let show = false;

    let lang = 'js';
    let codeSnippets = {};
    let os = 'unknown';
    let category = 'Unix';

    const siteId = $page.params.site;
    codeSnippets = setCodeSnippets(lang);

    onMount(() => {
        // lang = setLanguage($func.runtime);
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

    function setCodeSnippets(lang: string) {
        return {
            Unix: {
                code: `appwrite functions createDeployment \\
    --siteId=${siteId} \\
    --entrypoint='index.${lang}' \\
    --code="." \\
    --activate=true`,
                language: 'bash'
            },

            CMD: {
                code: `appwrite functions createDeployment ^
    --siteId=${siteId} ^
    --entrypoint='index.${lang}' ^
    --code="." ^
    --activate=true`,
                language: 'CMD'
            },
            PowerShell: {
                code: `appwrite functions createDeployment ,
    --siteId=${siteId} ,
    --entrypoint='index.${lang}' ,
    --code="." ,
    --activate=true`,
                language: 'PowerShell'
            }
        };
    }
</script>

<Modal title="Create CLI deployment" bind:show hideFooter>
    <span slot="description">
        Deploy your site using the Appwrite CLI by running the following command inside your
        function's folder.
    </span>

    <Layout.Stack gap="l">
        <Layout.Stack gap="s">
            <Tabs.Root let:root stretch>
                {#each ['Unix', 'CMD', 'PowerShell'] as cat}
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (category = cat)}
                        active={category === cat}>
                        {cat}
                    </Tabs.Item.Button>
                {/each}
            </Tabs.Root>

            {#each ['Unix', 'CMD', 'PowerShell'] as cat}
                {#if category === cat}
                    <Code hideHeader lang="sh" code={codeSnippets[cat].code} />
                {/if}
            {/each}
        </Layout.Stack>

        <Alert dismissible={false} type="warning">
            If you did not create your site using the CLI, initialize your site by following our <a
                href="https://appwrite.io/docs/tooling/command-line/installation"
                target="_blank"
                rel="noopener noreferrer"
                class="link">documentation</a
            >.
        </Alert>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
