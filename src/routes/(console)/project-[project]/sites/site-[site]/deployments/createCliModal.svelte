<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { Link } from '$lib/elements';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Alert, Code, Layout, Tabs } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let site: Models.Site;

    let codeSnippets = {};
    let os = 'unknown';
    let category = 'Unix';

    const siteId = page.params.site;
    codeSnippets = getCodeSnippets();

    onMount(() => {
        codeSnippets = getCodeSnippets();
        os = navigator['userAgentData']?.platform || navigator?.platform || 'unknown';

        if (os.includes('Win')) {
            category = 'CMD';
        } else if (os.includes('Mac') || os.includes('Linux')) {
            category = 'Unix';
        } else {
            category = 'Unix';
        }
    });

    function getCodeSnippets() {
        const projectId = page.params.project;
        const codePath = `./sites/${framework}`;
        const { framework, buildCommand, installCommand, outputDirectory } = site;

        return {
            Unix: {
                code: `appwrite client --projectId="${projectId}" && \\
appwrite sites create-deployment \\
    --site-id="${siteId}" \\
    --code="${codePath}" \\
    --activate \\
    --build-command="${buildCommand}" \\
    --install-command="${installCommand}" \\
    --output-directory="${outputDirectory}"`,
                language: 'bash'
            },

            CMD: {
                code: `appwrite client --projectId="${projectId}" && ^
appwrite sites createDeployment ^
    --siteId=${siteId} ^
    --code="${codePath}" ^
    --activate ^
    --build-command="${buildCommand}" ^
    --install-command="${installCommand}" ^
    --output-directory="${outputDirectory}"`,
                language: 'CMD'
            },

            PowerShell: {
                code: `appwrite client --projectId="${projectId}" ;
appwrite sites createDeployment ,
    --siteId=${siteId} ,
    --code="${codePath}" ,
    --activate ,
    --build-command="${buildCommand}" ,
    --install-command="${installCommand}" ,
    --output-directory="${outputDirectory}"`,
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
