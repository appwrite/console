<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import Link from '$lib/elements/link.svelte';
    import { Alert, Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { getChangePlanUrl, isStarterPlan } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { page } from '$app/state';

    export let site: Models.Site;
    export let specs: Models.SpecificationList;

    let buildSpecification = site.buildSpecification;
    let runtimeSpecification = site.runtimeSpecification;
    let originalBuild = site.buildSpecification;
    let originalRuntime = site.runtimeSpecification;

    $: {
        originalBuild = site.buildSpecification ?? buildSpecification;
        originalRuntime = site.runtimeSpecification ?? runtimeSpecification;
    }

    async function updateResourceLimits() {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: site.framework as Framework,
                enabled: site?.enabled || undefined,
                logging: site?.logging || undefined,
                timeout: site?.timeout || undefined,
                installCommand: site?.installCommand || undefined,
                buildCommand: site?.buildCommand || undefined,
                outputDirectory: site?.outputDirectory || undefined,
                buildRuntime: (site?.buildRuntime as BuildRuntime) || undefined,
                adapter: site?.adapter as Adapter,
                fallbackFile: site?.fallbackFile || undefined,
                installationId: site?.installationId || undefined,
                providerRepositoryId: site?.providerRepositoryId || undefined,
                providerBranch: site?.providerBranch || undefined,
                providerSilentMode: site?.providerSilentMode || undefined,
                providerRootDirectory: site?.providerRootDirectory || undefined,
                buildSpecification: buildSpecification || undefined,
                runtimeSpecification: runtimeSpecification || undefined
            });
            await invalidate(Dependencies.SITE);

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
        Define your site's compute specifications, including CPU and memory, to optimize performance for
        your workloads. <Link href="https://appwrite.io/docs/advanced/platform/compute" external>
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
                        CPU and memory used when installing dependencies and building your site for
                        deployment.
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
                        CPU and memory used when your site serves traffic, including server-side
                        rendering (SSR).
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
