<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime, type Models, type Scopes } from '@appwrite.io/console';
    import Link from '$lib/elements/link.svelte';
    import { Alert, Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { isStarterPlan, getChangePlanUrl } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { page } from '$app/state';

    export let func: Models.Function;
    export let specs: Models.SpecificationList;

    let buildSpecification = func.buildSpecification;
    let runtimeSpecification = func.runtimeSpecification;
    let originalBuild = func.buildSpecification;
    let originalRuntime = func.runtimeSpecification;

    $: {
        originalBuild = func.buildSpecification ?? buildSpecification;
        originalRuntime = func.runtimeSpecification ?? runtimeSpecification;
    }

    async function updateResourceLimits() {
        try {
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId: func.$id,
                name: func.name,
                runtime: func.runtime,
                execute: func.execute || undefined,
                events: func.events || undefined,
                schedule: func.schedule || undefined,
                timeout: func.timeout || undefined,
                enabled: func.enabled || undefined,
                logging: func.logging || undefined,
                entrypoint: func.entrypoint || undefined,
                commands: func.commands || undefined,
                scopes: (func.scopes as Scopes[]) || undefined,
                installationId: func.installationId || undefined,
                providerRepositoryId: func.providerRepositoryId || undefined,
                providerBranch: func.providerBranch || undefined,
                providerSilentMode: func.providerSilentMode || undefined,
                providerRootDirectory: func.providerRootDirectory || undefined,
                buildSpecification: buildSpecification || undefined,
                runtimeSpecification: runtimeSpecification || undefined
            });

            await invalidate(Dependencies.FUNCTION);

            addNotification({
                type: 'success',
                message: 'Resource limits have been updated'
            });
            trackEvent(Submit.FunctionUpdateLogging);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateLogging);
        }
    }

    const options = (specs?.specifications ?? []).map((spec) => ({
        label: `${spec.cpus} CPU, ${spec.memory} MB RAM`,
        value: spec.slug,
        disabled: !spec.enabled
    }));
</script>

<Form onSubmit={updateResourceLimits}>
    <CardGrid>
        <svelte:fragment slot="title">Resource limits</svelte:fragment>
        Define your function's compute specifications, including CPU and memory, to optimize performance
        for your workloads. <Link
            href="https://appwrite.io/docs/advanced/platform/compute"
            external>
            Learn more
        </Link>.
        <svelte:fragment slot="aside">
            <InputSelect
                label="Build specification"
                id="build-specification"
                required
                disabled={options.length < 1}
                bind:value={buildSpecification}
                {options}>
                <Tooltip slot="info">
                    <Icon icon={IconInfo} size="s" />
                    <span slot="tooltip">
                        CPU and memory used when building and packaging your function deployment.
                    </span>
                </Tooltip>
            </InputSelect>
            <InputSelect
                label="Runtime specification"
                id="runtime-specification"
                required
                disabled={options.length < 1}
                bind:value={runtimeSpecification}
                {options}>
                <Tooltip slot="info">
                    <Icon icon={IconInfo} size="s" />
                    <span slot="tooltip">
                        CPU and memory available to each function execution at runtime.
                    </span>
                </Tooltip>
            </InputSelect>

            <!-- always show upgrade on starters -->
            {@const isStarter = isStarterPlan($organization.billingPlanId)}
            {#if isCloud && isStarter}
                <Alert.Inline title="Customizing specs available with Pro or Scale plans">
                    Upgrade your plan to adjust your CPU and RAM beyond the default.
                    <svelte:fragment slot="actions">
                        <Button href={getChangePlanUrl($organization.$id)} compact>Upgrade</Button>
                    </svelte:fragment>
                </Alert.Inline>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={originalBuild === buildSpecification &&
                    originalRuntime === runtimeSpecification}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
