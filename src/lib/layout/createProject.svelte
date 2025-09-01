<script lang="ts">
    import { Layout, Typography, Input, Tag, Icon, Alert } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId } from '$lib/components/index.js';
    import { getFlagUrl } from '$lib/helpers/flag';
    import { isCloud } from '$lib/system.js';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { filterRegions } from '$lib/helpers/regions';
    import type { Snippet } from 'svelte';
    import { BillingPlan } from '$lib/constants';
    import { formatCurrency } from '$lib/helpers/numbers';

    let {
        projectName = $bindable(''),
        id = $bindable(''),
        regions = [],
        region = $bindable(''),
        showTitle = true,
        billingPlan = undefined,
        projects = undefined,
        submit
    }: {
        projectName: string;
        id: string;
        regions: Array<Models.ConsoleRegion>;
        region: string;
        showTitle: boolean;
        billingPlan?: BillingPlan;
        projects?: number;
        submit?: Snippet;
    } = $props();

    let showCustomId = $state(false);
    let isProPlan = $derived((billingPlan ?? $organization?.billingPlan) === BillingPlan.PRO);
    let projectsLimited = $derived(
        isProPlan
            ? projects && projects >= 2
            : $currentPlan?.projects > 0 && projects && projects >= $currentPlan?.projects
    );
</script>

<svelte:head>
    {#each regions as region}
        <link rel="preload" as="image" href={getFlagUrl(region.flag)} />
    {/each}
</svelte:head>

<Layout.Stack direction="column" gap="xxl">
    {#if showTitle}
        <Typography.Title size="l">Create your project</Typography.Title>
    {/if}

    <Layout.Stack direction="column" gap="xxl">
        <Layout.Stack direction="column" gap="xxl">
            <Layout.Stack direction="column" gap="s">
                <Input.Text
                    disabled={!isProPlan && projectsLimited}
                    label="Name"
                    placeholder="Project name"
                    required
                    autofocus
                    bind:value={projectName} />
                {#if !showCustomId}
                    <div>
                        <Tag
                            size="s"
                            on:click={() => {
                                showCustomId = true;
                            }}><Icon icon={IconPencil} slot="start" size="s" /> Project ID</Tag>
                    </div>
                {/if}
                <CustomId bind:show={showCustomId} name="Project" isProject bind:id />
            </Layout.Stack>

            {#if isCloud && regions.length > 0}
                <Layout.Stack gap="xs">
                    <Input.Select
                        disabled={!isProPlan && projectsLimited}
                        required
                        bind:value={region}
                        placeholder="Select a region"
                        options={filterRegions(regions)}
                        label="Region" />
                    <Typography.Text>Region cannot be changed after creation</Typography.Text>
                </Layout.Stack>
            {/if}
            {#if projectsLimited}
                {#if isProPlan}
                    <Alert.Inline
                        status="info"
                        title="Expand for {formatCurrency(
                            $currentPlan?.addons?.projects?.price || 15
                        )}/project per month">
                        Each added project comes with its own dedicated pool of resources.
                    </Alert.Inline>
                {:else}
                    <Alert.Inline
                        status="warning"
                        title={`You've reached your limit of ${$currentPlan?.projects} projects`}>
                        Extra projects are available on paid plans for an additional fee
                        <svelte:fragment slot="actions">
                            <Button
                                compact
                                size="s"
                                href={`${base}/organization-${page.params.organization}/billing`}
                                external>Upgrade</Button>
                        </svelte:fragment>
                    </Alert.Inline>
                {/if}
            {/if}
        </Layout.Stack>
    </Layout.Stack>
    {@render submit?.()}
</Layout.Stack>
