<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { func } from '../store';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { specificationsList } from '$lib/stores/specifications';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime, type Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import Link from '$lib/elements/link.svelte';

    const functionId = page.params.function;
    export let runtimesList: Models.RuntimeList;
    let { runtime, entrypoint, specification } = $func;

    const options = runtimesList.runtimes.map((runtime) => ({
        label: `${runtime.name} - ${runtime.version}`,
        value: runtime.$id
    }));
    const specificationOptions = $specificationsList.specifications.map((size) => ({
        label:
            `${size.cpus} CPU, ${size.memory} MB RAM` +
            (!size.enabled ? ` (Upgrade to use this)` : ''),
        value: size.slug
    }));

    async function updateRuntime() {
        try {
            if (!isValueOfStringEnum(Runtime, runtime)) {
                throw new Error(`Invalid runtime: ${runtime}`);
            }
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.update(
                    functionId,
                    $func.name,
                    runtime,
                    $func.execute || undefined,
                    $func.events || undefined,
                    $func.schedule || undefined,
                    $func.timeout || undefined,
                    $func.enabled || undefined,
                    $func.logging || undefined,
                    entrypoint || undefined,
                    $func.commands || undefined,
                    $func.scopes || undefined,
                    $func.installationId || undefined,
                    $func.providerRepositoryId || undefined,
                    $func.providerBranch || undefined,
                    $func.providerSilentMode || undefined,
                    $func.providerRootDirectory || undefined,
                    $func.specification || undefined
                );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Runtime settings have been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdateRuntime, { runtime });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdateRuntime);
        }
    }

    $: isUpdateButtonEnabled = runtime !== $func?.runtime || entrypoint !== $func?.entrypoint;
</script>

<Form onSubmit={updateRuntime}>
    <CardGrid>
        <svelte:fragment slot="title">Runtime</svelte:fragment>
        <Typography.Text>
            Select the runtime for executing your function and define its entrypoint. Version
            changes apply on redeploy and can be updated here. <Link external href="#"
                >Learn more</Link
            >.
        </Typography.Text>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="l">
                <InputSelect
                    label="Runtime"
                    id="runtime"
                    placeholder="Select runtime"
                    bind:value={runtime}
                    {options}
                    required />
                <InputText
                    label="Entrypoint"
                    id="entrypoint"
                    required
                    placeholder="Enter entrypoint"
                    bind:value={entrypoint} />
                <InputSelect
                    label="CPU and memory"
                    id="size"
                    placeholder="Select runtime specification"
                    bind:value={specification}
                    options={specificationOptions} />
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isUpdateButtonEnabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
