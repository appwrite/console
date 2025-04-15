<script lang="ts">
    import { Collapsible, CollapsibleItem, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputSelect, InputText } from '$lib/elements/forms';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { choices, createFunction, installation, repository } from '../store';
    import { runtimesList } from '$lib/stores/runtimes';
    import { page } from '$app/stores';

    let showCustomId = false;

    let detectingRuntime = true;
    async function loadDetection(
        installationId: string,
        repositoryId: string,
        rootDirectory: string
    ) {
        const detection = await sdk
            .forProject($page.params.region, $page.params.project)
            .vcs.createRepositoryDetection(installationId, repositoryId, rootDirectory);

        return detection;
    }

    let options = [];

    onMount(async () => {
        options = (await $runtimesList).runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        }));

        try {
            const detection = await loadDetection(
                $installation.$id,
                $repository.id,
                $choices.rootDir
            );
            $createFunction.runtime = detection.runtime;
        } catch (err) {
            console.error(err);
        } finally {
            detectingRuntime = false;
        }
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Configuration</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set your deployment configuration and any build commands here.
    </svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Function name"
            autofocus
            bind:value={$createFunction.name}
            required />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Function ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId
                autofocus
                bind:show={showCustomId}
                name="Function"
                bind:id={$createFunction.$id}
                fullWidth />
        {/if}

        {#if detectingRuntime}
            <InputSelect
                disabled
                label="Runtime"
                id="runtime"
                placeholder="Detecting runtime"
                value={null}
                options={[]} />
        {:else}
            <InputSelect
                label="Runtime"
                id="runtime"
                placeholder="Select runtime"
                bind:value={$createFunction.runtime}
                {options}
                required />
        {/if}

        <InputText
            label="Entrypoint"
            id="entrypoint"
            placeholder="Entrypoint"
            bind:value={$createFunction.entrypoint}
            required />
        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Build commands</svelte:fragment>
                <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                <FormList>
                    <InputTextarea
                        label="Commands"
                        placeholder="Enter a build command (e.g. 'npm install')"
                        id="build"
                        tooltip="Enter a single command or chain multiple commands with the && operator"
                        bind:value={$createFunction.commands} />
                </FormList>
            </CollapsibleItem>
        </Collapsible>
    </FormList>
</WizardStep>
