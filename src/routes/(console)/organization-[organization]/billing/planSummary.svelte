<script lang="ts">
    import { base } from '$app/paths';
    import { EstimatedCard } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import type { AggregationTeam, Invoice, Plan } from '$lib/sdk/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Divider, Typography, Expandable as ExpandableTable } from '@appwrite.io/pink-svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatNum } from '$lib/helpers/string';
    import { ProgressBar } from '$lib/components';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import CancelDowngradeModel from './cancelDowngradeModal.svelte';

    export let currentPlan: Plan;
    export let currentInvoice: Invoice | undefined = undefined;
    export let currentAggregation: AggregationTeam | undefined = undefined;
    export let organizationUsage: any = undefined;
    export let usageProjects: Record<string, any> = {};

    let showCancel: boolean = false;

    // define columns for the expandable table
    const columns = [
        { id: 'item', align: 'left' as const, width: '10fr' },
        { id: 'usage', align: 'left' as const, width: '20fr' },
        { id: 'price', align: 'right' as const, width: '0fr' }
    ];

    // Create a map for all projects to their breakdown data
    $: allProjectsBreakdown = new Map(
        projectsList.map((project) => [
            project.projectId,
            project.breakdown || {
                $id: project.projectId,
                amount: 0,
                resources: {}
            }
        ])
    );

    function formatHumanSize(bytes: number): string {
        const size = humanFileSize(bytes || 0);
        return `${size.value} ${size.unit}`;
    }

    function formatBandwidthUsage(currentBytes: number, maxGB?: number): string {
        const currentSize = humanFileSize(currentBytes || 0);
        if (!maxGB) {
            return `${currentSize.value} ${currentSize.unit} / Unlimited`;
        }
        const maxSize = humanFileSize(maxGB * 1024 * 1024 * 1024);
        return `${currentSize.value} ${currentSize.unit} / ${maxSize.value} ${maxSize.unit}`;
    }

    function truncateForSmall(name: string): string {
        if (!name) return name;
        return name.length > 12 ? `${name.slice(0, 12)}…` : name;
    }

    // helper function to get resource amount from backend data
    function getResourceAmount(projectBreakdown: any, resourceId: string): number {
        if (!projectBreakdown?.resources) return 0;

        const resource = Array.isArray(projectBreakdown.resources)
            ? projectBreakdown.resources.find((r: any) => r.resourceId === resourceId)
            : projectBreakdown.resources[resourceId];

        return resource?.amount || 0;
    }

    function getResourceUsage(projectBreakdown: any, resourceId: string): number {
        if (!projectBreakdown?.resources) return 0;

        const resource = Array.isArray(projectBreakdown.resources)
            ? projectBreakdown.resources.find((r: any) => r.resourceId === resourceId)
            : projectBreakdown.resources[resourceId];

        return resource?.value || 0;
    }

    function getProgressColor(_percentage: number): string {
        return 'var(--bgcolor-neutral-invert)';
    }

    function createProgressData(
        currentValue: number,
        maxValue: number | string
    ): Array<{ size: number; color: string; tooltip?: { title: string; label: string } }> {
        if (
            maxValue === null ||
            maxValue === undefined ||
            (typeof maxValue === 'number' && maxValue <= 0)
        ) {
            return [];
        }

        const max = typeof maxValue === 'string' ? parseFloat(maxValue) : maxValue;
        if (max <= 0) return [];

        const percentage = Math.min((currentValue / max) * 100, 100);
        const progressColor = getProgressColor(percentage);

        return [
            {
                size: currentValue,
                color: progressColor,
                tooltip: {
                    title: `${percentage.toFixed(1)}% used`,
                    label: `${currentValue.toLocaleString()} of ${max.toLocaleString()}`
                }
            }
        ];
    }

    function createStorageProgressData(
        currentBytes: number,
        maxGB: number
    ): Array<{ size: number; color: string; tooltip?: { title: string; label: string } }> {
        if (maxGB <= 0) return [];

        const maxBytes = maxGB * 1024 * 1024 * 1024;
        const percentage = Math.min((currentBytes / maxBytes) * 100, 100);
        const progressColor = getProgressColor(percentage);

        const currentSize = humanFileSize(currentBytes);

        return [
            {
                size: currentBytes,
                color: progressColor,
                tooltip: {
                    title: `${percentage.toFixed(0)}% used`,
                    label: `${currentSize.value} ${currentSize.unit} of ${maxGB} GB`
                }
            }
        ];
    }

    $: projectsList = (() => {
        // Get all projects from usageProjects (which now contains all organization projects)
        const allProjectIds = Object.keys(usageProjects);

        if (allProjectIds.length === 0) {
            return [];
        }

        return allProjectIds.map((projectId) => {
            // Find the corresponding project data from organizationUsage
            const projectData = organizationUsage?.projects?.find(
                (proj: any) => proj.projectId === projectId
            );

            // Find the corresponding breakdown data
            const breakdownData = currentAggregation?.projectBreakdown?.find(
                (p: any) => p.$id === projectId
            );

            return {
                projectId: projectId,
                storage: projectData?.storage || 0,
                executions: projectData?.executions || 0,
                executionsMBSeconds: projectData?.executionsMBSeconds || 0,
                bandwidth: projectData?.bandwidth || 0,
                databasesReads: projectData?.databasesReads || 0,
                databasesWrites: projectData?.databasesWrites || 0,
                users: projectData?.users || 0,
                authPhoneTotal: projectData?.authPhoneTotal || 0,
                authPhoneEstimate: projectData?.authPhoneEstimate || 0,
                breakdown: breakdownData
            };
        });
    })();

    $: billingData = [
        {
            id: 'base-plan',
            expandable: false,
            cells: {
                item: 'Base plan',
                usage: '',
                price: formatCurrency(currentPlan?.price || 0)
            },
            children: []
        },
        ...(currentAggregation?.resources
            ?.filter(
                (r) =>
                    r.amount &&
                    r.amount > 0 &&
                    Object.keys(currentPlan.addons || {}).includes(r.resourceId) &&
                    currentPlan.addons[r.resourceId]?.price > 0
            )
            ?.map((excess) => ({
                id: `addon-${excess.resourceId}`,
                expandable: false,
                cells: {
                    item:
                        excess.resourceId === 'seats'
                            ? 'Additional members'
                            : excess.resourceId === 'projects'
                              ? `Additional Projects (${formatNum(excess.value)})`
                              : `${excess.resourceId} overage (${formatNum(excess.value)})`,
                    usage: '',
                    price: formatCurrency(excess.amount)
                },
                children: []
            })) || []),
        ...(projectsList?.map((project) => {
            const projectBreakdown = allProjectsBreakdown.get(project.projectId);

            return {
                id: `project-${project.projectId}`,
                expandable: true,
                cells: {
                    item: $isSmallViewport
                        ? truncateForSmall(
                              usageProjects[project.projectId]?.name ||
                                  `Project ${project.projectId}`
                          )
                        : usageProjects[project.projectId]?.name || `Project ${project.projectId}`,
                    usage: '',
                    price: formatCurrency(projectBreakdown?.amount || 0)
                },
                children: [
                    // Bandwidth
                    {
                        id: `project-${project.projectId}-bandwidth`,
                        cells: {
                            item: 'Bandwidth',
                            usage: `${formatBandwidthUsage(getResourceUsage(projectBreakdown, 'bandwidth') || project.bandwidth || 0, currentPlan?.bandwidth)}`,
                            price: formatCurrency(getResourceAmount(projectBreakdown, 'bandwidth'))
                        },
                        progressData: createStorageProgressData(
                            getResourceUsage(projectBreakdown, 'bandwidth') ||
                                project.bandwidth ||
                                0,
                            currentPlan?.bandwidth || 0
                        ),
                        maxValue: currentPlan?.bandwidth
                            ? currentPlan.bandwidth * 1024 * 1024 * 1024
                            : 0
                    },
                    // Users
                    {
                        id: `project-${project.projectId}-users`,
                        cells: {
                            item: 'Users',
                            usage: `${formatNum(getResourceUsage(projectBreakdown, 'users') || project.users || 0)} / ${currentPlan?.users ? formatNum(currentPlan.users) : 'Unlimited'}`,
                            price: formatCurrency(getResourceAmount(projectBreakdown, 'users'))
                        },
                        progressData: createProgressData(
                            getResourceUsage(projectBreakdown, 'users') || project.users || 0,
                            currentPlan?.users
                        ),
                        maxValue: currentPlan?.users
                    },
                    // Database reads
                    {
                        id: `project-${project.projectId}-reads`,
                        cells: {
                            item: 'Database reads',
                            usage: `${formatNum(getResourceUsage(projectBreakdown, 'databasesReads') || project.databasesReads || 0)} / ${currentPlan?.databasesReads ? formatNum(currentPlan.databasesReads) : 'Unlimited'}`,
                            price: formatCurrency(
                                getResourceAmount(projectBreakdown, 'databasesReads')
                            )
                        },
                        progressData: createProgressData(
                            getResourceUsage(projectBreakdown, 'databasesReads') ||
                                project.databasesReads ||
                                0,
                            currentPlan?.databasesReads
                        ),
                        maxValue: currentPlan?.databasesReads
                    },
                    // Database writes
                    {
                        id: `project-${project.projectId}-writes`,
                        cells: {
                            item: 'Database writes',
                            usage: `${formatNum(getResourceUsage(projectBreakdown, 'databasesWrites') || project.databasesWrites || 0)} / ${currentPlan?.databasesWrites ? formatNum(currentPlan.databasesWrites) : 'Unlimited'}`,
                            price: formatCurrency(
                                getResourceAmount(projectBreakdown, 'databasesWrites')
                            )
                        },
                        progressData: createProgressData(
                            getResourceUsage(projectBreakdown, 'databasesWrites') ||
                                project.databasesWrites ||
                                0,
                            currentPlan?.databasesWrites
                        ),
                        maxValue: currentPlan?.databasesWrites
                    },
                    // Executions
                    {
                        id: `project-${project.projectId}-executions`,
                        cells: {
                            item: 'Executions',
                            usage: `${formatNum(getResourceUsage(projectBreakdown, 'executions') || project.executions || 0)} / ${currentPlan?.executions ? formatNum(currentPlan.executions) : 'Unlimited'}`,
                            price: formatCurrency(getResourceAmount(projectBreakdown, 'executions'))
                        },
                        progressData: createProgressData(
                            getResourceUsage(projectBreakdown, 'executions') ||
                                project.executions ||
                                0,
                            currentPlan?.executions
                        ),
                        maxValue: currentPlan?.executions
                    },
                    // Storage
                    {
                        id: `project-${project.projectId}-storage`,
                        cells: {
                            item: 'Storage',
                            usage: `${formatHumanSize(getResourceUsage(projectBreakdown, 'storage') || project.storage || 0)} / ${currentPlan?.storage?.toString() || '0'} GB`,
                            price: formatCurrency(getResourceAmount(projectBreakdown, 'storage'))
                        },
                        progressData: createStorageProgressData(
                            getResourceUsage(projectBreakdown, 'storage') || project.storage || 0,
                            currentPlan?.storage || 0
                        ),
                        maxValue: currentPlan?.storage
                            ? currentPlan.storage * 1024 * 1024 * 1024
                            : 0
                    },
                    // GB-hours (executions time)
                    {
                        id: `project-${project.projectId}-gb-hours`,
                        cells: {
                            item: 'GB-hours',
                            usage: `${formatNum((getResourceUsage(projectBreakdown, 'GBHours') || project.executionsMBSeconds || 0) / 1000 / 3600 || 0)} / ${currentPlan?.executions ? formatNum((currentPlan.executions * 1000 * 3600) / 1000 / 3600) : 'Unlimited'}`,
                            price: formatCurrency(getResourceAmount(projectBreakdown, 'GBHours'))
                        },
                        progressData: currentPlan?.executions
                            ? createProgressData(
                                  (getResourceUsage(projectBreakdown, 'GBHours') ||
                                      project.executionsMBSeconds ||
                                      0) /
                                      1000 /
                                      3600,
                                  (currentPlan.executions * 1000 * 3600) / 1000 / 3600
                              )
                            : [],
                        maxValue: currentPlan?.executions
                            ? (currentPlan.executions * 1000 * 3600) / 1000 / 3600
                            : null
                    },
                    // Phone OTP (no progress bar)
                    {
                        id: `project-${project.projectId}-sms`,
                        cells: {
                            item: 'Phone OTP',
                            usage: `${formatNum(project.authPhoneTotal || 0)} SMS messages`,
                            price: formatCurrency(project.authPhoneEstimate || 0)
                        }
                    },
                    // Usage details link
                    {
                        id: `project-${project.projectId}-usage-details`,
                        cells: {
                            item: `<a href="${base}/project-${usageProjects[project.projectId]?.region || 'default'}-${project.projectId}/settings/usage" style="text-decoration: underline; color: var(--fgcolor-accent-neutral);">Usage details</a>`,
                            usage: '',
                            price: ''
                        }
                    }
                ]
            };
        }) || []),
        // Show info if no projects found
        ...(projectsList && projectsList.length === 0
            ? [
                  {
                      id: 'no-projects',
                      expandable: false,
                      cells: {
                          item: 'No projects found',
                          usage: '',
                          price: formatCurrency(0)
                      },
                      children: []
                  }
              ]
            : [])
    ];

    $: totalAmount = currentInvoice?.amount || currentPlan?.price || 0;
</script>

{#if $organization}
    <EstimatedCard>
        <Typography.Title size="s">{currentPlan.name} plan</Typography.Title>

        <Typography.Text color="--fgcolor-neutral-primary">
            Next payment of <span class="text u-bold"
                >{formatCurrency(currentInvoice?.amount || currentPlan?.price || 0)}</span>
            will occur on
            <span class="text u-bold">{toLocaleDate($organization?.billingNextInvoiceDate)}</span>.
        </Typography.Text>

        <Divider />
        <div class="billing-cycle-header">
            <Typography.Text color="--fgcolor-neutral-primary" variant="m-500">
                Current billing cycle ({new Date(
                    $organization?.billingCurrentInvoiceDate
                ).toLocaleDateString('en', { day: 'numeric', month: 'short' })}-{new Date(
                    $organization?.billingNextInvoiceDate
                ).toLocaleDateString('en', { day: 'numeric', month: 'short' })})
            </Typography.Text>
            <Typography.Text color="--fgcolor-neutral-tertiary" variant="m-400">
                Estimate, subject to change based on usage.
            </Typography.Text>
        </div>
        <!-- Billing breakdown table -->
        <div class="table-wrapper" class:is-mobile={$isSmallViewport}>
            <ExpandableTable.Root {columns} showHeader={false} let:root>
                {#each billingData as row}
                    <ExpandableTable.Row {root} id={row.id} expandable={row.expandable ?? false}>
                        {#each columns as col}
                            <ExpandableTable.Cell
                                {root}
                                column={col.id}
                                expandable={row.expandable ?? false}
                                isOpen={root.isOpen(row.id)}
                                toggle={() => root.toggle(row.id)}>
                                {#if col.id === 'item'}
                                    <div class="cell-item-text">
                                        <Typography.Text>
                                            {row.cells?.[col.id] ?? ''}
                                        </Typography.Text>
                                    </div>
                                {:else}
                                    <Typography.Text>
                                        {row.cells?.[col.id] ?? ''}
                                    </Typography.Text>
                                {/if}
                            </ExpandableTable.Cell>
                        {/each}

                        <svelte:fragment slot="summary">
                            {#if row.children}
                                {#each row.children as child (child.id)}
                                    <div
                                        class="child-row"
                                        class:is-tablet={$isTabletViewport && !$isSmallViewport}
                                        style="grid-template-columns: {root.childGridTemplate}; --original-grid-template: {root.childGridTemplate};">
                                        {#each columns as col}
                                            <div
                                                class="child-cell"
                                                class:price={col.id === 'price'}
                                                class:is-mobile={$isSmallViewport}
                                                style="justify-content: {root.alignment(
                                                    col.align
                                                )};">
                                                {#if child.cells?.[col.id]?.includes('<a href=')}
                                                    {@html child.cells?.[col.id] ?? ''}
                                                {:else if col.id === 'usage'}
                                                    <div
                                                        class="usage-cell-content"
                                                        class:is-mobile={$isSmallViewport}
                                                        class:is-tablet={$isTabletViewport &&
                                                            !$isSmallViewport}>
                                                        <div class="usage-progress-section">
                                                            {#if child.progressData && child.progressData.length > 0 && child.maxValue}
                                                                <ProgressBar
                                                                    maxSize={child.maxValue}
                                                                    data={child.progressData} />
                                                            {/if}
                                                        </div>
                                                        <div class="usage-text-section">
                                                            {#if child.cells?.[col.id]?.includes(' / ')}
                                                                {@const usageParts = (
                                                                    child.cells?.[col.id] ?? ''
                                                                ).split(' / ')}
                                                                <Typography.Text
                                                                    variant="m-400"
                                                                    color="--fgcolor-neutral-secondary">
                                                                    {usageParts[0]}
                                                                </Typography.Text>
                                                                <Typography.Text
                                                                    variant="m-400"
                                                                    color="--fgcolor-neutral-tertiary">
                                                                    {' / '}
                                                                </Typography.Text>
                                                                <Typography.Text
                                                                    variant="m-400"
                                                                    color="--fgcolor-neutral-tertiary">
                                                                    {usageParts[1]}
                                                                </Typography.Text>
                                                            {:else}
                                                                <Typography.Text
                                                                    variant="m-400"
                                                                    color="--fgcolor-neutral-secondary">
                                                                    {child.cells?.[col.id] ?? ''}
                                                                </Typography.Text>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                {:else}
                                                    <Typography.Text
                                                        variant="m-400"
                                                        color="--fgcolor-neutral-secondary">
                                                        {child.cells?.[col.id] ?? ''}
                                                    </Typography.Text>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                {/each}
                            {/if}
                        </svelte:fragment>
                    </ExpandableTable.Row>
                {/each}

                <ExpandableTable.Row {root} id="total-row" expandable={false}>
                    <ExpandableTable.Cell
                        {root}
                        column="item"
                        expandable={false}
                        isOpen={false}
                        toggle={() => {}}>
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            Total
                        </Typography.Text>
                    </ExpandableTable.Cell>
                    <ExpandableTable.Cell
                        {root}
                        column="usage"
                        expandable={false}
                        isOpen={false}
                        toggle={() => {}}>
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        </Typography.Text>
                    </ExpandableTable.Cell>
                    <ExpandableTable.Cell
                        {root}
                        column="price"
                        expandable={false}
                        isOpen={false}
                        toggle={() => {}}>
                        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            {formatCurrency(totalAmount)}
                        </Typography.Text>
                    </ExpandableTable.Cell>
                </ExpandableTable.Row>
            </ExpandableTable.Root>
        </div>

        <!-- Actions -->
        <div class="actions-container">
            {#if $organization?.billingPlan === BillingPlan.FREE || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                <div
                    class="u-flex u-cross-center u-gap-8 u-flex-wrap u-width-full-line u-main-end actions-mobile">
                    {#if !currentPlan?.usagePerProject}
                        <Button text href={`${base}/organization-${$organization?.$id}/usage`}>
                            View estimated usage
                        </Button>
                    {/if}
                    <Button
                        disabled={$organization?.markedForDeletion}
                        href={$upgradeURL}
                        on:click={() =>
                            trackEvent(Click.OrganizationClickUpgrade, {
                                from: 'button',
                                source: 'billing_tab'
                            })}>
                        Upgrade
                    </Button>
                </div>
            {:else}
                <div
                    class="u-flex u-cross-center u-gap-8 u-flex-wrap u-width-full-line u-main-end actions-mobile">
                    {#if $organization?.billingPlanDowngrade !== null}
                        <Button text on:click={() => (showCancel = true)}>Cancel change</Button>
                    {:else}
                        <Button
                            text
                            disabled={$organization?.markedForDeletion}
                            href={$upgradeURL}
                            on:click={() =>
                                trackEvent('click_organization_plan_update', {
                                    from: 'button',
                                    source: 'billing_tab'
                                })}>
                            Change plan
                        </Button>
                    {/if}
                    {#if !currentPlan?.usagePerProject}
                        <Button secondary href={`${base}/organization-${$organization?.$id}/usage`}>
                            View estimated usage
                        </Button>
                    {/if}
                </div>
            {/if}
        </div>
    </EstimatedCard>
{/if}

<CancelDowngradeModel bind:showCancel />

<style>
    .billing-cycle-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        margin-top: 1rem;
    }

    :global(.card-only-on-desktop) {
        background: hsl(var(--color-neutral-5));
        border-radius: var(--corner-radius-medium, 8px);
        border: 1px solid var(--billing-card-border-color);
    }

    :global(.theme-dark .card-only-on-desktop) {
        background: #2c2c2f;
        --billing-card-border-color: #424248;
    }

    :global(.card-only-on-desktop .collapsible-item:only-of-type) {
        margin-block-start: 0.5rem;
        border-block-start: solid 0.0625rem hsl(var(--p-toggle-border-color));
    }

    /* indent child rows on tablet */
    :global(.child-row.is-tablet) {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    /* prevent wrapping on desktop; truncate on small/tablet */
    .cell-item-text {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(.theme-dark) .cell-item-text,
    :global(.theme-light) .cell-item-text {
        display: block;
    }

    /* Small and tablet: allow truncation to avoid multi-line wrapping */
    @media (max-width: 1024px) {
        .cell-item-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .usage-cell-content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 1.5rem;
        gap: 0.75rem;
        width: 100%;
        min-height: 2rem;
    }

    /* tablet tweaks */
    :global(.usage-cell-content.is-tablet) {
        padding-left: 1rem;
        gap: 0.5rem;
    }

    /* mobile tweaks: compact inline layout with proper spacing */
    :global(.usage-cell-content.is-mobile) {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        padding-left: 0;
        min-height: 2rem;
        flex-wrap: nowrap;
    }

    .usage-text-section {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 1rem;
        flex: 1;
        text-align: left;
    }

    :global(.usage-cell-content.is-mobile .usage-text-section),
    :global(.usage-cell-content.is-tablet .usage-text-section) {
        padding-left: 0;
    }

    .usage-progress-section {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 264px;
    }

    :global(.usage-progress-section .progressbar__container) {
        margin-top: 0;
        width: 264px;
        max-width: 264px;
        /* Neutral background for unfilled track */
        --progressbar-background-color: var(--bgcolor-neutral-tertiary);
    }

    /* smaller bars for tablet/mobile */
    :global(.usage-cell-content.is-tablet .usage-progress-section .progressbar__container) {
        width: 200px;
        max-width: 200px;
    }
    :global(.usage-cell-content.is-mobile .usage-progress-section .progressbar__container) {
        width: 120px;
        max-width: 120px;
    }

    :global(.usage-cell-content.is-mobile .usage-progress-section) {
        width: 120px;
        flex-shrink: 0;
    }

    /* mobile table wrapper for horizontal scroll */
    .table-wrapper.is-mobile {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin: 0 -1rem;
        padding: 0 1rem;
    }

    /* reset mobile overrides - use desktop layout in scrollable container */
    .table-wrapper.is-mobile :global(.child-row) {
        grid-template-columns: var(--original-grid-template) !important;
        min-width: 600px; /* ensure minimum width for proper layout */
    }

    .table-wrapper.is-mobile :global(.usage-cell-content) {
        flex-direction: row !important;
        align-items: center !important;
        gap: 0.75rem !important;
        padding-left: 1rem !important;
        min-height: 2rem !important;
    }

    .table-wrapper.is-mobile :global(.usage-progress-section) {
        width: 200px !important;
        flex-shrink: 0 !important;
    }

    .table-wrapper.is-mobile :global(.usage-progress-section .progressbar__container) {
        width: 200px !important;
        max-width: 200px !important;
    }

    @media (max-width: 768px) {
        .actions-mobile {
            justify-content: flex-start !important;
            gap: 8px !important;
        }

        .actions-mobile :global(a),
        .actions-mobile :global(button) {
            padding: 6px 12px !important;
            font-size: 14px !important;
            border-radius: 8px !important;
        }
        .billing-cycle-header {
            flex-direction: column;
            gap: 8px;
        }

        :global([data-expandable-row-id='additional-projects']),
        :global([data-expandable-row-id^='addon-']) {
            background-color: var(--bgcolor-neutral-tertiary);
            border-left: 3px solid var(--bgcolor-accent-neutral);
        }

        :global(.card-only-on-desktop) {
            padding: 0.5rem;
            box-shadow: unset;
            border-radius: unset;

            /* yes, these `!important`s are needed */
            border: unset !important;
            background: unset !important;
        }
    }
</style>
