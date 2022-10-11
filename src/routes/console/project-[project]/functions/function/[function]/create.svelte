<script lang="ts">
    import { InputChoice, Button, InputFile, InputText, Form } from '$lib/elements/forms';
    import { Modal, Collapsible, CollapsibleItem } from '$lib/components';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import FormList from '$lib/elements/forms/formList.svelte';

    export let showCreate = false;

    let mode: 'cli' | 'github' | 'manual' = 'cli';
    let entrypoint: string;
    let code: FileList;
    let active: boolean;

    const functionId = $page.params.function;
    const dispatch = createEventDispatcher();

    const create = async () => {
        try {
            await sdkForProject.functions.createDeployment(functionId, entrypoint, code[0], active);
            code = entrypoint = active = null;
            showCreate = false;
            dispatch('created');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form noMargin on:submit={create}>
    <Modal size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create Deployment</svelte:fragment>
        <div class="tabs">
            <ul class="tabs-list">
                <li class="tabs-item">
                    <span
                        class="tabs-button"
                        on:click={() => (mode = 'cli')}
                        class:is-selected={mode === 'cli'}>
                        <span class="text">CLI</span>
                    </span>
                </li>
                <li class="tabs-item">
                    <span
                        class="tabs-button"
                        on:click={() => (mode = 'github')}
                        class:is-selected={mode === 'github'}>
                        <span class="text">GitHub - Soon!</span>
                    </span>
                </li>
                <li class="tabs-item">
                    <span
                        class="tabs-button"
                        on:click={() => (mode = 'manual')}
                        class:is-selected={mode === 'manual'}>
                        <span class="text">Manual</span>
                    </span>
                </li>
            </ul>
        </div>
        {#if mode === 'cli'}
            <p class="text">
                You can deploy your function from the Appwrite CLI using Unix, CMD, or PowerShell.
                Check out our Documentation to learn more about <a
                    href="#/"
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
                        Code
                    </CollapsibleItem>
                {/each}
            </Collapsible>
        {:else if mode === 'github'}
            <p>Coming Soon</p>
        {:else if mode === 'manual'}
            <FormList>
                <InputText
                    label="Entrypoint"
                    placeholder="main.py"
                    id="entrypoint"
                    bind:value={entrypoint}
                    required />
                <InputFile label="Gzipped code (tar.gz)" bind:value={code} required />
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
