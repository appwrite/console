<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { Alert, Code, Layout, Tabs } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';

    export let show = false;

    let lang = 'js';
    let codeSnippets = {};
    let os = 'unknown';
    let category = 'Unix';

    const siteId = page.params.site;
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
                code: `appwrite client --projectId="${page.params.project}" && \\
appwrite sites create-deployment \\
    --site-id="${siteId}" \\
    --code="." \\
    --activate`,
                language: 'bash'
            },

            CMD: {
                code: `appwrite client --projectId="${page.params.project}" && ^
appwrite sites createDeployment ^
    --siteId=${siteId} ^
    --code="." ^
    --activate`,
                language: 'CMD'
            },
            PowerShell: {
                code: `appwrite client --projectId="${page.params.project}" && ,
appwrite sites createDeployment ,
    --siteId=${siteId} ,
    --code="." ,
    --activate`,
                language: 'PowerShell'
            }
        };
    }
</script>

<Modal title="Create CLI deployment" bind:show hideFooter>
    <span slot="description">
        Deploy your site using the Appwrite CLI by running the following command inside your sites's
        folder.
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

            <Code hideHeader lang="sh" code={codeSnippets[category].code} />
        </Layout.Stack>

        <Alert.Inline status="info">
            If it's your first time using CLI, remember to <Link
                href="https://appwrite.io/docs/tooling/command-line/installation#install-with-npm"
                external>install CLI</Link> and <Link
                href="https://appwrite.io/docs/tooling/command-line/installation#login"
                external>login to your account</Link> before running deployment command.
        </Alert.Inline>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
