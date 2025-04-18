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

    export let site: Models.Site;
    export let specs: Models.SpecificationList;
    let specification = site.specification;

    async function updateLogging() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site.framework as Framework,
                site.enabled || undefined,
                site.logging || undefined,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                (site?.buildRuntime as BuildRuntime) || undefined,
                site.adapter as Adapter,
                site.fallbackFile || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined,
                specification || undefined
            );
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
            <Button disabled={site.specification === specification} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
