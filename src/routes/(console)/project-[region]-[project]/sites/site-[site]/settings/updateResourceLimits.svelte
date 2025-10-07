<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import Link from '$lib/elements/link.svelte';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { page } from '$app/state';

    export let site: Models.Site;
    export let specs: Models.SpecificationList;
    let specification = site.specification;
    let originalSpecification = site.specification;

    async function updateLogging() {
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
                providerRootDirectory: site?.providerRootDirectory || undefined
            });
            await invalidate(Dependencies.SITE);
            originalSpecification = specification;

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

    const options = specs.specifications.map((spec) => ({
        label: `${spec.cpus} CPU, ${spec.memory} MB RAM`,
        value: spec.slug,
        disabled: !spec.enabled
    }));
</script>

<Form onSubmit={updateLogging}>
    <CardGrid>
        <svelte:fragment slot="title">Resource limits</svelte:fragment>
        Define your sites's compute specifications, including CPU and memory, to optimize performance
        for your workloads. <Link
            href="https://appwrite.io/docs/advanced/platform/compute"
            external>
            Learn more
        </Link>.
        <svelte:fragment slot="aside">
            <InputSelect
                label="CPU and memory"
                id="resources"
                required
                disabled={options.length < 1}
                bind:value={specification}
                {options} />
            {#if isCloud && $organization.billingPlan === BillingPlan.FREE}
                <Alert.Inline title="Customizing specs available with Pro or Scale plans">
                    Upgrade to Pro or Scale to adjust your CPU and RAM beyond the default.
                    <svelte:fragment slot="actions">
                        <Button href={$upgradeURL} compact>Upgrade</Button>
                    </svelte:fragment>
                </Alert.Inline>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={originalSpecification === specification} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
