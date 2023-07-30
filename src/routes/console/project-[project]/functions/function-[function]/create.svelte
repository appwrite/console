<script lang="ts">
    import { InputChoice, Button, InputText, InputFile, FormList } from '$lib/elements/forms';
    import { Modal, Collapsible, CollapsibleItem, Tabs, Tab, Code } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onMount } from 'svelte';
    import { page } from '$app/stores';
    import GithubLight from '$lib/images/github-illustration-light.svg';
    import GithubDark from '$lib/images/github-illustration-dark.svg';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { func } from './store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { app } from '$lib/stores/app';
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;

    enum Mode {
        CLI,
        Github,
        Manual
    }
    let mode: Mode = Mode.CLI;
    let entrypoint: string;
    let active = false;
    let files: FileList;
    let lang = 'js';
    let codeSnippets = {};
    let os = 'unknown';
    let error: string = null;

    const functionId = $page.params.function;
    const dispatch = createEventDispatcher();

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

    async function create() {
        try {
            await sdk.forProject.functions.createDeployment(
                functionId,
                entrypoint,
                files[0],
                active
            );
            await invalidate(Dependencies.DEPLOYMENTS);
            files = undefined;
            entrypoint = null;
            active = false;
            showCreate = false;
            dispatch('created');
            trackEvent(Submit.DeploymentCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DeploymentCreate);
        }
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

    $: if (!showCreate) {
        files = undefined;
        entrypoint = null;
        active = false;
        error = null;
    }
</script>

<Modal {error} size="big" bind:show={showCreate} onSubmit={create}>
    <svelte:fragment slot="header"
        >{$LL.console.project.forms.functions.title.createDeployment()}</svelte:fragment>
    <Tabs>
        <Tab on:click={() => (mode = Mode.CLI)} selected={mode === Mode.CLI} event="deploy_cli">
            CLI
        </Tab>
        <Tab
            on:click={() => (mode = Mode.Github)}
            selected={mode === Mode.Github}
            event="deploy_github">
            GitHub - (Soon)
        </Tab>
        <Tab
            on:click={() => (mode = Mode.Manual)}
            selected={mode === Mode.Manual}
            event="deploy_manual">Manual</Tab>
    </Tabs>
    {#if mode === Mode.CLI}
        <p class="text">
            {$LL.console.project.forms.functions.texts.deployFunction()}
            <a
                href="https://appwrite.io/docs/functions#deployFunction"
                target="_blank"
                rel="noopener noreferrer"
                class="link">{$LL.console.project.forms.functions.texts.deployYourFunction()}</a
            >, {$LL.console.project.forms.functions.texts.installAndUse()}
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
    {:else if mode === Mode.Github}
        <div class="grid-1-1 u-gap-16">
            {#if $app.themeInUse === 'dark'}
                <img src={GithubDark} alt="github" />
            {:else}
                <img src={GithubLight} alt="github" />
            {/if}
            <div class="u-flex u-flex-vertical u-gap-24">
                <h3 class="body-text-1 u-bold">
                    {$LL.console.project.forms.functions.title.commingSoon()}
                </h3>
                <p>
                    {$LL.console.project.forms.functions.texts.easyDeployments()}
                </p>
            </div>
        </div>
    {:else if mode === Mode.Manual}
        <FormList>
            <InputText
                label={$LL.console.project.forms.functions.inputs.entryPoint.label()}
                placeholder={`main.${lang}`}
                id="entrypoint"
                bind:value={entrypoint}
                required />
            <InputFile
                label="Gzipped code (tar.gz)"
                allowedFileExtensions={['gz']}
                bind:files
                required={true} />
            <InputChoice
                label={$LL.console.project.forms.functions.inputs.activeDeployment.label()}
                id="activate"
                bind:value={active}>
                {$LL.console.project.forms.functions.texts.deploymentBuild()}</InputChoice>
        </FormList>
    {/if}
    <svelte:fragment slot="footer">
        {#if mode === Mode.Manual}
            <Button secondary on:click={() => (showCreate = false)}
                >{$LL.console.project.button.close()}</Button>
            <Button submit>{$LL.console.project.button.submit.create()}</Button>
        {:else}
            <Button secondary on:click={() => (showCreate = false)}
                >{$LL.console.project.button.close()}</Button>
        {/if}
    </svelte:fragment>
</Modal>
