<script lang="ts">
    import { InputChoice, Button, InputText, InputFile, Form } from '$lib/elements/forms';
    import { Modal, Collapsible, CollapsibleItem, Tabs, Tab, Code } from '$lib/components';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import FormList from '$lib/elements/forms/formList.svelte';
    import Github from '$lib/images/github-illustration.svg';

    export let showCreate = false;

    let mode: 'cli' | 'github' | 'manual' = 'cli';
    let entrypoint: string;
    let active: boolean;
    let files: FileList;

    const functionId = $page.params.function;
    const dispatch = createEventDispatcher();

    const create = async () => {
        try {
            await sdkForProject.functions.createDeployment(
                functionId,
                entrypoint,
                files[0],
                active
            );
            files = entrypoint = active = null;
            showCreate = false;
            dispatch('created');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    const codeSnippets = {
        Unix: {
            code: `appwrite functions createDeployment \\ 
    --functionId=${functionId} \\ 
    --entrypoint='index.js' \\ 
    --code="." \\ 
    --activate=true`,
            language: 'bash'
        },

        CMD: {
            code: `appwrite functions createDeployment ^
    --functionId=${functionId} ^
    --entrypoint='index.js' ^
    --code="." ^
    --activate=true`,
            language: 'CMD'
        },
        PowerShell: {
            code: `appwrite functions createDeployment ,
    --functionId=${functionId} ,
    --entrypoint='index.js' ,
    --code="." ,
    --activate=true`,
            language: 'PowerShell'
        }
    };
</script>

<Form noMargin on:submit={create}>
    <Modal size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create Deployment</svelte:fragment>
        <Tabs>
            <Tab on:click={() => (mode = 'cli')} selected={mode === 'cli'}>CLI</Tab>
            <Tab on:click={() => (mode = 'github')} selected={mode === 'github'}
                >GitHub - Soon!</Tab>
            <Tab on:click={() => (mode = 'manual')} selected={mode === 'manual'}>Manual</Tab>
        </Tabs>
        {#if mode === 'cli'}
            <p class="text">
                You can deploy your function from the Appwrite CLI using Unix, CMD, or PowerShell.
                Check out our Documentation to learn more about <a
                    href="https://appwrite.io/docs/functions#deployFunction"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">deploying your functions</a
                >, or how to install and use the
                <a href="#/" target="_blank" rel="noopener noreferrer" class="link">Appwrite CLI</a
                >.
            </p>
            <Collapsible>
                {#each ['Unix', 'CMD', 'PowerShell'] as category}
                    <CollapsibleItem>
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
        {:else if mode === 'github'}
            <div class="common-section grid-1-2">
                <div class="grid-1-2-col-1 u-flex u-flex-vertical u-gap-16">
                    <img src={Github} alt="github" />
                </div>
                <div class="grid-1-2-col-2 u-flex u-flex-vertical u-gap-24">
                    <h3 class="body-text-1">Coming Soon!</h3>
                    <p>
                        Creating deployments will be easier than ever with our upcoming Git
                        Integration. Just set up a repository and we’ll do the rest.
                    </p>
                </div>
            </div>
        {:else if mode === 'manual'}
            <FormList>
                <InputText
                    label="Entrypoint"
                    placeholder="main.py"
                    id="entrypoint"
                    bind:value={entrypoint}
                    required />
                <InputFile label="Gzipped code (tar.gz)" bind:files />
                <InputChoice
                    label="Activate Deployment after build"
                    id="activate"
                    bind:value={active}>
                    This deployment will be activated after the build is completed.</InputChoice>
            </FormList>
        {/if}
        <svelte:fragment slot="footer">
            {#if mode === 'manual'}
                <Button secondary on:click={() => (showCreate = false)}>Close</Button>
                <Button submit>Create</Button>
            {:else}
                <Button secondary on:click={() => (showCreate = false)}>Close</Button>
            {/if}
        </svelte:fragment>
    </Modal>
</Form>
