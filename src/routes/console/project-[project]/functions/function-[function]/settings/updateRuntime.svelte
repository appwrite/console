<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { runtimesList, specs } from '../../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';

    const functionId = $page.params.function;
    let runtime: string = null;
    let memory: number = null;
    let cpus: number = null;

    let options = [];
    let cpuOptions = [];
    let memoryOptions = [];

    onMount(async () => {
        runtime ??= $func.runtime;
        memory ??= $func.memory;
        cpus ??= $func.cpus;

        let runtimes = await $runtimesList;
        let allowedSpecs = await $specs;
        options = runtimes.runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        })); 

        memoryOptions = allowedSpecs.memory.map((memory) =>
            memory > 1024
                ? {
                      label: `${memory / 1024} GB`,
                      value: memory
                  }
                : {
                      label: `${memory} MB`,
                      value: memory
                  }
        );

        cpuOptions = allowedSpecs.cpus.map((cpu) => ({
            label: cpu === 1 ? `${cpu} CPU Cores` : `${cpu} CPU Core`,
            value: cpu
        }));
    });

    async function updateRuntime() {
        try {
            if (!isValueOfStringEnum(Runtime, runtime)) {
                throw new Error(`Invalid runtime: ${runtime}`);
            }
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                runtime,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled || undefined,
                $func.logging || undefined,
                $func.entrypoint || undefined,
                $func.commands || undefined,
                $func.installationId || undefined,
                $func.providerRepositoryId || undefined,
                $func.providerBranch || undefined,
                $func.providerSilentMode || undefined,
                $func.providerRootDirectory || undefined,
                memory,
                cpus
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Runtime settings have been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdateName);
        }
    }

    $: isUpdateButtonEnabled =
        runtime !== $func?.runtime || cpus !== $func?.cpus || memory !== $func?.memory;
</script>

<Form onSubmit={updateRuntime}>
    <CardGrid>
        <Heading tag="h6" size="7">Runtime</Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputSelect
                    label="Runtime"
                    id="runtime"
                    placeholder="Select runtime"
                    bind:value={runtime}
                    {options}
                    required
                    hideRequired />
                <InputSelect
                    label="Memory Limit"
                    id="memory"
                    placeholder="Select memory"
                    bind:value={memory}
                    options={memoryOptions}
                    required
                    hideRequired />
                <InputSelect
                    label="CPU Limit"
                    id="cpus"
                    placeholder="Select cpu cores"
                    bind:value={cpus}
                    options={cpuOptions}
                    required
                    hideRequired />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isUpdateButtonEnabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
