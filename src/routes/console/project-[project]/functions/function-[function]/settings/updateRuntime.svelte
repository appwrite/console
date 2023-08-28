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

    const functionId = $page.params.function;
    let runtime: string = null;

    let options = [];

    onMount(async () => {
        runtime ??= $func.runtime;

        let runtimes = await $page.data.runtimes;
        options = runtimes.runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        }));
    });

    async function updateRuntime() {
        try {
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
                $func.providerRootDirectory || undefined
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Runtime has been updated',
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
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={runtime === $func.runtime} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
