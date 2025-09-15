<script lang="ts">
    import { base } from '$app/paths';
    import { EstimatedCard, Pagination as PaginationComponent } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import type { AggregationTeam, Plan } from '$lib/sdk/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        Typography,
        AccordionTable,
        Icon,
        Layout,
        Divider,
        Badge
    } from '@appwrite.io/pink-svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatNum } from '$lib/helpers/string';
    import { ProgressBar } from '$lib/components';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import CancelDowngradeModel from './cancelDowngradeModal.svelte';
    import { IconTag } from '@appwrite.io/pink-icons-svelte';

    export let currentPlan: Plan;
    export let nextPlan: Plan | null = null;
    export let availableCredit: number | undefined = undefined;
    export let currentAggregation: AggregationTeam | undefined = undefined;
    export let limit: number | undefined = undefined;
    export let offset: number | undefined = undefined;
    // key to force refresh on page change
    export let aggregationKey: string | undefined = undefined;

    let showCancel: boolean = false;

    // define columns for the accordion table
    const columns = [
        { id: 'item', align: 'left' as const, width: { min: 200 } },
        { id: 'usage', align: 'left' as const, width: { min: 500 } },
        { id: 'price', align: 'right' as const, width: { min: 100 } }
    ];

    function formatHumanSize(bytes: number): string {
        const size = humanFileSize(bytes || 0);
        return `${size.value} ${size.unit}`;
    }

    function formatBandwidthUsage(currentBytes: number, maxGB?: number): string {
        const currentSize = humanFileSize(currentBytes || 0);
        if (!maxGB) {
            return `${currentSize.value} ${currentSize.unit} / Unlimited`;
        }
        const maxSize = humanFileSize(maxGB * 1000 * 1000 * 1000);
        return `${currentSize.value} ${currentSize.unit} / ${maxSize.value} ${maxSize.unit}`;
    }

    function truncateForSmall(name: string): string {
        if (!name) return name;
        return name.length > 12 ? `${name.slice(0, 12)}…` : name;
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
        const progressColor = 'var(--bgcolor-neutral-invert)';

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

        const maxBytes = maxGB * 1000 * 1000 * 1000;
        const percentage = Math.min((currentBytes / maxBytes) * 100, 100);
        const progressColor = 'var(--bgcolor-neutral-invert)';

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

    function getProjectsList(currentAggregation) {
        return (
            currentAggregation?.breakdown?.map((projectData) => ({
                projectId: projectData.$id,
                name: projectData.name,
                region: projectData.region,
                amount: projectData.amount,
                storage: projectData?.resources?.find((res) => res.resourceId === 'storage'),
                executions: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'executions'
                ),
                gbHours: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'GBHours'
                ),
                imageTransformations: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'imageTransformations'
                ),
                bandwidth: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'bandwidth'
                ),
                databasesReads: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'databasesReads'
                ),
                databasesWrites: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'databasesWrites'
                ),
                users: projectData?.resources?.find((resource) => resource.resourceId === 'users'),
                authPhone: projectData?.resources?.find(
                    (resource) => resource.resourceId === 'authPhone'
                )
            })) || []
        );
    }

    import { page } from '$app/state';

    let projectsLimit: number = 5;
    let projectsOffset: number = 0;
    $: projectsLimit = limit ?? (Number(page.url.searchParams.get('limit')) || 5);
    $: projectsOffset =
        offset ?? ((Number(page.url.searchParams.get('page')) || 1) - 1) * projectsLimit;
    $: totalProjects =
        (currentAggregation && (currentAggregation as any).breakdownTotal) ||
        (currentAggregation && (currentAggregation as any).projectsTotal) ||
        (currentAggregation?.resources?.find?.((r) => r.resourceId === 'projects')?.value ??
            null) ||
        currentAggregation?.breakdown?.length ||
        0;

    function getBillingData(currentPlan, currentAggregation, isSmallViewport) {
        const projectsList = getProjectsList(currentAggregation);
        const base = {
            id: 'base-plan',
            expandable: false,
            cells: {
                item: 'Base plan',
                usage: '',
                price: formatCurrency(nextPlan?.price ?? currentPlan?.price ?? 0)
            },
            children: []
        };
        const addons = (currentAggregation?.resources || [])
            .filter(
                (r) =>
                    r.amount &&
                    r.amount > 0 &&
                    Object.keys(currentPlan?.addons || {}).includes(r.resourceId) &&
                    currentPlan.addons[r.resourceId]?.price > 0
            )
            .map((excess) => ({
                id: `addon-${excess.resourceId}`,
                expandable: false,
                cells: {
                    item:
                        excess.resourceId === 'seats'
                            ? 'Additional members'
                            : excess.resourceId === 'projects'
                              ? 'Additional projects'
                              : `${excess.resourceId} overage (${formatNum(excess.value)})`,
                    usage: '',
                    price: formatCurrency(excess.amount)
                },
                // provide a badge count for additional projects
                badge: excess.resourceId === 'projects' ? formatNum(excess.value) : null,
                children: []
            }));
        const projects = projectsList.map((project) => ({
            id: `project-${project.projectId}`,
            expandable: true,
            cells: {
                item: isSmallViewport
                    ? truncateForSmall(project.name)
                    : project.name || `Project ${project.projectId}`,
                usage: '',
                price: formatCurrency(project.amount || 0)
            },
            children: [
                {
                    id: `bandwidth`,
                    cells: {
                        item: 'Bandwidth',
                        usage: `${formatBandwidthUsage(project.bandwidth.value, currentPlan?.bandwidth)}`,
                        price: formatCurrency(project.bandwidth.amount || 0)
                    },
                    progressData: createStorageProgressData(
                        project.bandwidth.value || 0,
                        currentPlan?.bandwidth || 0
                    ),
                    maxValue: currentPlan?.bandwidth
                        ? currentPlan.bandwidth * 1000 * 1000 * 1000
                        : 0
                },
                {
                    id: `users`,
                    cells: {
                        item: 'Users',
                        usage: `${formatNum(project.users.value || 0)} / ${currentPlan?.users ? formatNum(currentPlan.users) : 'Unlimited'}`,
                        price: formatCurrency(project.users.amount || 0)
                    },
                    progressData: createProgressData(project.users.value || 0, currentPlan?.users),
                    maxValue: currentPlan?.users
                },
                {
                    id: `reads`,
                    cells: {
                        item: 'Database reads',
                        usage: `${formatNum(project.databasesReads.value || 0)} / ${currentPlan?.databasesReads ? formatNum(currentPlan.databasesReads) : 'Unlimited'}`,
                        price: formatCurrency(project.databasesReads.amount || 0)
                    },
                    progressData: createProgressData(
                        project.databasesReads.value || 0,
                        currentPlan?.databasesReads
                    ),
                    maxValue: currentPlan?.databasesReads
                },
                {
                    id: `writes`,
                    cells: {
                        item: 'Database writes',
                        usage: `${formatNum(project.databasesWrites.value || 0)} / ${currentPlan?.databasesWrites ? formatNum(currentPlan.databasesWrites) : 'Unlimited'}`,
                        price: formatCurrency(project.databasesWrites.amount || 0)
                    },
                    progressData: createProgressData(
                        project.databasesWrites.value || 0,
                        currentPlan?.databasesWrites
                    ),
                    maxValue: currentPlan?.databasesWrites
                },
                {
                    id: `executions`,
                    cells: {
                        item: 'Executions',
                        usage: `${formatNum(project.executions.value || 0)} / ${currentPlan?.executions ? formatNum(currentPlan.executions) : 'Unlimited'}`,
                        price: formatCurrency(project.executions.amount || 0)
                    },
                    progressData: createProgressData(
                        project.executions.value || 0,
                        currentPlan?.executions
                    ),
                    maxValue: currentPlan?.executions
                },
                {
                    id: `storage`,
                    cells: {
                        item: 'Storage',
                        usage: `${formatHumanSize(project.storage.value || 0)} / ${currentPlan?.storage?.toString() || '0'} GB`,
                        price: formatCurrency(project.storage.amount || 0)
                    },
                    progressData: createStorageProgressData(
                        project.storage.value || 0,
                        currentPlan?.storage || 0
                    ),
                    maxValue: currentPlan?.storage ? currentPlan.storage * 1000 * 1000 * 1000 : 0
                },
                {
                    id: `image-transformations`,
                    cells: {
                        item: 'Image transformations',
                        usage: `${formatNum(project.imageTransformations.value || 0)} / ${currentPlan?.imageTransformations ? formatNum(currentPlan.imageTransformations) : 'Unlimited'}`,
                        price: formatCurrency(project.imageTransformations.amount || 0)
                    },
                    progressData: createProgressData(
                        project.imageTransformations.value || 0,
                        currentPlan?.imageTransformations
                    ),
                    maxValue: currentPlan?.imageTransformations
                },
                {
                    id: `gb-hours`,
                    cells: {
                        item: 'GB-hours',
                        usage: `${formatNum(project.gbHours.value || 0)} / ${currentPlan?.GBHours ? formatNum(currentPlan.GBHours) : 'Unlimited'}`,
                        price: formatCurrency(project.gbHours.amount || 0)
                    },
                    progressData: currentPlan?.GBHours
                        ? createProgressData(project.gbHours.value || 0, currentPlan.GBHours)
                        : [],
                    maxValue: currentPlan?.GBHours ? currentPlan.GBHours : null
                },
                {
                    id: `sms`,
                    cells: {
                        item: 'Phone OTP',
                        usage: `${formatNum(project.authPhone.value || 0)} SMS messages`,
                        price: formatCurrency(project.authPhone.amount || 0)
                    }
                },
                {
                    id: `usage-details`,
                    cells: {
                        item: `<a href="/console/project-${String(project.region || 'default')}-${project.projectId}/settings/usage" style="text-decoration: underline; color: var(--fgcolor-accent-neutral);">Usage details</a>`,
                        usage: '',
                        price: ''
                    }
                }
            ]
        }));
        const noProjects = [];
        return [base, ...addons, ...projects, ...noProjects];
    }

    $: billingData = getBillingData(currentPlan, currentAggregation, $isSmallViewport);

    $: totalAmount = Math.max(currentAggregation?.amount - creditsApplied, 0);

    $: creditsApplied = Math.min(
        currentAggregation?.amount ?? currentPlan?.price ?? 0,
        availableCredit
    );
</script>

{#if $organization}
    {#key aggregationKey}
        <EstimatedCard>
            <Typography.Title size="s" gap="s">{currentPlan.name} plan</Typography.Title>

            {#if totalAmount > 0}
                <Typography.Text color="--fgcolor-neutral-secondary">
                    Next payment of <span class="text --fgcolor-neutral-primary u-bold"
                        >{formatCurrency(totalAmount)}</span>
                    will occur on
                    <span class="text --fgcolor-neutral-primary u-bold"
                        >{toLocaleDate($organization?.billingNextInvoiceDate)}</span
                    >.
                </Typography.Text>
            {/if}
            <Divider />
            <div class="billing-cycle-header">
                <Typography.Text color="--fgcolor-neutral-secondary" variant="m-500">
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
            <div class:is-mobile={$isSmallViewport}>
                <AccordionTable.Root {columns} let:root>
                    {#each billingData as row}
                        <AccordionTable.Row {root} id={row.id} expandable={row.expandable ?? false}>
                            {#each columns as col}
                                <AccordionTable.Cell {root} column={col.id}>
                                    {#if col.id === 'item'}
                                        <div class="cell-item-text">
                                            {#if row.badge}
                                                <Layout.Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    gap="xs">
                                                    <Typography.Text>
                                                        {row.cells?.[col.id] ?? ''}
                                                    </Typography.Text>
                                                    <Badge
                                                        variant="secondary"
                                                        size="xs"
                                                        content={row.badge} />
                                                </Layout.Stack>
                                            {:else}
                                                <Typography.Text>
                                                    {row.cells?.[col.id] ?? ''}
                                                </Typography.Text>
                                            {/if}
                                        </div>
                                    {:else}
                                        <Typography.Text>
                                            {row.cells?.[col.id] ?? ''}
                                        </Typography.Text>
                                    {/if}
                                </AccordionTable.Cell>
                            {/each}

                            <svelte:fragment slot="summary" let:root>
                                {#if row.children}
                                    {#each row.children as child (child.id)}
                                        <AccordionTable.Summary.Row {root}>
                                            <AccordionTable.Summary.Cell
                                                {root}
                                                column="item"
                                                alignment="middle-start">
                                                {#if child.cells?.item?.includes('<a href=')}
                                                    {@html child.cells?.item ?? ''}
                                                {:else}
                                                    <Typography.Text
                                                        variant="m-400"
                                                        color="--fgcolor-neutral-secondary">
                                                        {child.cells?.item ?? ''}
                                                    </Typography.Text>
                                                {/if}
                                            </AccordionTable.Summary.Cell>
                                            <AccordionTable.Summary.Cell
                                                {root}
                                                column="usage"
                                                alignment="middle-start">
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
                                                        {#if child.cells?.usage?.includes(' / ')}
                                                            {@const usageParts = (
                                                                child.cells?.usage ?? ''
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
                                                                {child.cells?.usage ?? ''}
                                                            </Typography.Text>
                                                        {/if}
                                                    </div>
                                                </div>
                                            </AccordionTable.Summary.Cell>
                                            <AccordionTable.Summary.Cell
                                                {root}
                                                column="price"
                                                alignment="middle-end">
                                                <Typography.Text
                                                    variant="m-400"
                                                    color="--fgcolor-neutral-secondary">
                                                    {child.cells?.price ?? ''}
                                                </Typography.Text>
                                            </AccordionTable.Summary.Cell>
                                        </AccordionTable.Summary.Row>
                                    {/each}
                                {/if}
                            </svelte:fragment>
                        </AccordionTable.Row>
                    {/each}
                    {#if totalProjects > projectsLimit}
                        <AccordionTable.Row {root} id="pagination-row" expandable={false}>
                            <AccordionTable.Cell {root} column="item">
                                <div class="pagination-left">
                                    <PaginationComponent
                                        limit={projectsLimit}
                                        offset={projectsOffset}
                                        sum={totalProjects} />
                                </div>
                            </AccordionTable.Cell>
                            <AccordionTable.Cell {root} column="usage"></AccordionTable.Cell>
                            <AccordionTable.Cell {root} column="price"></AccordionTable.Cell>
                        </AccordionTable.Row>
                    {/if}
                    {#if availableCredit > 0}
                        <AccordionTable.Row {root} id="total-row" expandable={false}>
                            <AccordionTable.Cell {root} column="item">
                                <Layout.Stack
                                    inline
                                    direction="row"
                                    gap="xxs"
                                    alignItems="center"
                                    alignContent="center">
                                    <Icon icon={IconTag} color="--fgcolor-success" size="s" />

                                    <Typography.Text color="--fgcolor-neutral-primary"
                                        >Credits</Typography.Text>
                                </Layout.Stack>
                            </AccordionTable.Cell>
                            <AccordionTable.Cell {root} column="usage">
                                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                </Typography.Text>
                            </AccordionTable.Cell>
                            <AccordionTable.Cell {root} column="price">
                                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                    -{formatCurrency(creditsApplied)}
                                </Typography.Text>
                            </AccordionTable.Cell>
                        </AccordionTable.Row>
                    {/if}

                    <AccordionTable.Row {root} id="total-row" expandable={false}>
                        <AccordionTable.Cell {root} column="item">
                            <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                Total
                            </Typography.Text>
                        </AccordionTable.Cell>
                        <AccordionTable.Cell {root} column="usage">
                            <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                            </Typography.Text>
                        </AccordionTable.Cell>
                        <AccordionTable.Cell {root} column="price">
                            <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                {formatCurrency(totalAmount)}
                            </Typography.Text>
                        </AccordionTable.Cell>
                    </AccordionTable.Row>
                </AccordionTable.Root>
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
                            <Button
                                secondary
                                href={`${base}/organization-${$organization?.$id}/usage`}>
                                View estimated usage
                            </Button>
                        {/if}
                    </div>
                {/if}
            </div>
        </EstimatedCard>
    {/key}
{/if}

<CancelDowngradeModel bind:showCancel />

<style>
    .billing-cycle-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
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
    @media (max-width: 1000px) {
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

    /* reducingh size of paginator */
    .pagination-left {
        display: inline-block;
        transform: scale(0.95);
        transform-origin: left center;
    }
</style>
