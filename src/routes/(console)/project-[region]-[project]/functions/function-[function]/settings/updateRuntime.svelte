<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { specificationsList } from '$lib/stores/specifications';
    import { runtimesList } from '$lib/stores/runtimes';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import SpecificationsTooltip from '$lib/wizards/functions/components/specificationsTooltip.svelte';

    const functionId = $page.params.function;
    let runtime: string = null;
    let specification: string = null;

    let options = [];
    let specificationOptions = [];

    onMount(async () => {
        runtime ??= $func.runtime;
        specification ??= $func.specification;

        let runtimes = await $runtimesList;
        let allowedSpecifications = (await $specificationsList).specifications;
        options = runtimes.runtimes.map((runtime) => ({
            label: `${runtime.name} - ${runtime.version}`,
            value: runtime.$id
        }));

        specificationOptions = allowedSpecifications.map((size) => ({
            label:
                `${size.cpus} CPU, ${size.memory} MB RAM` +
                (!size.enabled ? ` (Upgrade to use this)` : ''),
            value: size.slug,
            disabled: !size.enabled
        }));
    });

    async function updateRuntime() {
        try {
            if (!isValueOfStringEnum(Runtime, runtime)) {
                throw new Error(`Invalid runtime: ${runtime}`);
            }
            await sdk
                .forProject($page.params.region, $page.params.project)
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
                    $func.entrypoint || undefined,
                    $func.commands || undefined,
                    $func.scopes || undefined,
                    $func.installationId || undefined,
                    $func.providerRepositoryId || undefined,
                    $func.providerBranch || undefined,
                    $func.providerSilentMode || undefined,
                    $func.providerRootDirectory || undefined,
                    specification
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

    $: isUpdateButtonEnabled = runtime !== $func?.runtime || specification !== $func?.specification;
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
                    label="CPU and memory"
                    id="size"
                    placeholder="Select runtime specification"
                    bind:value={specification}
                    options={specificationOptions}
                    popover={isCloud && $organization?.billingPlan === BillingPlan.FREE
                        ? SpecificationsTooltip
                        : null}
                    required
                    hideRequired />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isUpdateButtonEnabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
