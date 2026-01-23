<script lang="ts">
    import { base } from '$app/paths';
    import { EstimatedCard, Pagination as PaginationComponent } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan, DEFAULT_BILLING_PROJECTS_LIMIT } from '$lib/constants';
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
    import { page } from '$app/state';
    import type { RowFactoryOptions } from '$routes/(console)/organization-[organization]/billing/store';
    import type { Models } from '@appwrite.io/console';

    let {
        currentPlan,
        nextPlan = null,
        availableCredit = undefined,
        currentAggregation = undefined,
        limit = undefined,
        offset = undefined
    }: {
        currentPlan: Models.BillingPlan;
        nextPlan?: Models.BillingPlan | null;
        availableCredit?: number | undefined;
        currentAggregation?: Models.AggregationTeam | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    } = $props();

    let showCancel = $state(false);

    // define columns for the accordion table
    const columns = [
        { id: 'item', align: 'left' as const, width: { min: 200 } },
        { id: 'usage', align: 'left' as const, width: { min: 500 } },
        { id: 'price', align: 'right' as const, width: { min: 100 } }
    ];

    const projectsLimit = $derived(
        limit ?? (Number(page.url.searchParams.get('limit')) || DEFAULT_BILLING_PROJECTS_LIMIT)
    );
    const projectsOffset = $derived(
        offset ?? ((Number(page.url.searchParams.get('page')) || 1) - 1) * projectsLimit
    );
    const projectBreakdownCount = $derived(currentAggregation?.breakdown?.length ?? 0);
    const hasProjectBreakdown = $derived(projectBreakdownCount > 0);
    const totalProjects = $derived(
        (currentAggregation?.resources?.find?.((r) => r.resourceId === 'projects')?.value ??
            null) ||
            projectBreakdownCount ||
            0
    );
    const aggregationKey = $derived(
        `agg:${Number(page.url.searchParams.get('page')) || 1}:${projectsLimit}`
    );
    const billingData = $derived(getBillingData(currentPlan, currentAggregation, $isSmallViewport));
    const baseAmount = $derived(currentAggregation?.amount ?? currentPlan?.price ?? 0);
    const creditsApplied = $derived(Math.min(baseAmount, availableCredit ?? 0));
    const totalAmount = $derived(Math.max(baseAmount - creditsApplied, 0));

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

    function getResource(resources: Array<Models.UsageResources> | undefined, resourceId: string) {
        return resources?.find((resource) => resource.resourceId === resourceId);
    }

    function createRow({
        id,
        label,
        resource,
        planLimit,
        formatValue = formatNum,
        usageFormatter,
        priceFormatter,
        progressFactory,
        maxFactory,
        includeProgress = true
    }: RowFactoryOptions) {
        const hasLimit = !!planLimit;
        const value = resource?.value || 0;
        const amount = resource?.amount || 0;

        const usage = usageFormatter
            ? usageFormatter({ value, planLimit, resource, formatValue, hasLimit })
            : hasLimit
              ? `${formatValue(value)} / ${formatValue(planLimit)}`
              : `${formatValue(value)} / Unlimited`;

        const price = priceFormatter
            ? priceFormatter({ amount, resource })
            : formatCurrency(amount);

        const progressData = includeProgress
            ? progressFactory
                ? progressFactory({ value, planLimit, resource, hasLimit })
                : hasLimit
                  ? createProgressData(value, planLimit)
                  : []
            : undefined;

        const maxValue = includeProgress
            ? maxFactory
                ? maxFactory({ planLimit, hasLimit, resource })
                : hasLimit
                  ? planLimit || null
                  : null
            : undefined;

        const row: {
            id: string;
            cells: { item: string; usage: string; price: string };
            progressData?: Array<{
                size: number;
                color: string;
                tooltip?: { title: string; label: string };
            }>;
            maxValue?: number | null;
        } = {
            id,
            cells: {
                item: label,
                usage,
                price
            }
        };

        if (includeProgress) {
            row.progressData = progressData;
            row.maxValue = maxValue ?? null;
        }

        return row;
    }

    function createResourceRow(
        id: string,
        label: string,
        resource: Models.UsageResources | undefined,
        planLimit: number | null | undefined,
        formatValue = formatNum
    ) {
        return createRow({ id, label, resource, planLimit, formatValue });
    }

    function getBillingData(
        currentPlan: Models.BillingPlan,
        currentAggregation: Models.AggregationTeam | undefined,
        isSmallViewport: boolean
    ) {
        // base plan row
        const basePlan = {
            id: 'base-plan',
            expandable: false,
            cells: {
                item: 'Base plan',
                usage: '',
                price: formatCurrency(nextPlan?.price ?? currentPlan?.price ?? 0)
            },
            badge: null,
            children: []
        };

        // addons (additional members, projects, etc.)
        const addons = (currentAggregation?.resources || [])
            .filter((r) => r.amount > 0 && currentPlan?.addons?.[r.resourceId]?.price > 0)
            .map((addon) => ({
                id: `addon-${addon.resourceId}`,
                expandable: false,
                cells: {
                    item:
                        addon.resourceId === 'seats'
                            ? 'Additional members'
                            : addon.resourceId === 'projects'
                              ? 'Additional projects'
                              : `${addon.resourceId} overage (${formatNum(addon.value)})`,
                    usage: '',
                    price: formatCurrency(addon.amount)
                },
                badge: addon.resourceId === 'projects' ? formatNum(addon.value) : null,
                children: []
            }));

        // project breakdown rows
        const projects = (currentAggregation?.breakdown || []).map((projectData) => {
            const resources = projectData.resources || [];
            const bandwidth = getResource(resources, 'bandwidth');
            const storage = getResource(resources, 'storage');
            const authPhone = getResource(resources, 'authPhone');

            return {
                id: `project-${projectData.$id}`,
                expandable: true,
                cells: {
                    item: isSmallViewport
                        ? truncateForSmall(projectData.name)
                        : projectData.name || `Project ${projectData.$id}`,
                    usage: '',
                    price: formatCurrency(projectData.amount || 0)
                },
                badge: null,
                children: [
                    createRow({
                        id: 'bandwidth',
                        label: 'Bandwidth',
                        resource: bandwidth,
                        planLimit: currentPlan?.bandwidth,
                        usageFormatter: ({ value, planLimit, hasLimit }) =>
                            formatBandwidthUsage(
                                value,
                                hasLimit ? (planLimit ?? undefined) : undefined
                            ),
                        priceFormatter: ({ amount }) => formatCurrency(amount),
                        progressFactory: ({ value, planLimit, hasLimit }) =>
                            hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
                        maxFactory: ({ planLimit, hasLimit }) =>
                            hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
                    }),
                    // standard resources (numeric)
                    createResourceRow(
                        'users',
                        'Users',
                        getResource(resources, 'users'),
                        currentPlan?.users
                    ),
                    createResourceRow(
                        'reads',
                        'Database reads',
                        getResource(resources, 'databasesReads'),
                        currentPlan?.databasesReads
                    ),
                    createResourceRow(
                        'writes',
                        'Database writes',
                        getResource(resources, 'databasesWrites'),
                        currentPlan?.databasesWrites
                    ),
                    createResourceRow(
                        'executions',
                        'Executions',
                        getResource(resources, 'executions'),
                        currentPlan?.executions
                    ),
                    createRow({
                        id: 'storage',
                        label: 'Storage',
                        resource: storage,
                        planLimit: currentPlan?.storage,
                        usageFormatter: ({ value, planLimit, hasLimit }) =>
                            hasLimit
                                ? `${formatHumanSize(value)} / ${planLimit?.toString() || '0'} GB`
                                : `${formatHumanSize(value)} / Unlimited`,
                        priceFormatter: ({ amount }) => formatCurrency(amount),
                        progressFactory: ({ value, planLimit, hasLimit }) =>
                            hasLimit ? createStorageProgressData(value, planLimit || 0) : [],
                        maxFactory: ({ planLimit, hasLimit }) =>
                            hasLimit ? (planLimit || 0) * 1000 * 1000 * 1000 : null
                    }),
                    createResourceRow(
                        'image-transformations',
                        'Image transformations',
                        getResource(resources, 'imageTransformations'),
                        currentPlan?.imageTransformations
                    ),
                    createResourceRow(
                        'screenshots-generated',
                        'Screenshots generated',
                        getResource(resources, 'screenshotsGenerated'),
                        currentPlan?.['screenshotsGenerated'], /* TODO: @itznotabug - needs correct SDK */
                    ),
                    createResourceRow(
                        'gb-hours',
                        'GB-hours',
                        getResource(resources, 'GBHours'),
                        currentPlan?.GBHours
                    ),
                    createRow({
                        id: 'sms',
                        label: 'Phone OTP',
                        resource: authPhone,
                        usageFormatter: ({ value }) => `${formatNum(value)} SMS messages`,
                        priceFormatter: ({ amount }) => formatCurrency(amount),
                        includeProgress: false
                    }),
                    createRow({
                        id: 'usage-details',
                        label: `<a href="${base}/project-${String(projectData.region || 'default')}-${projectData.$id}/settings/usage" style="text-decoration: underline; color: var(--fgcolor-accent-neutral);">Usage details</a>`,
                        usageFormatter: () => '',
                        priceFormatter: () => '',
                        includeProgress: false
                    })
                ]
            };
        });

        return [basePlan, ...addons, ...projects];
    }
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
                    {#if totalProjects > projectsLimit && hasProjectBreakdown}
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
                        <AccordionTable.Row {root} id="credits-row" expandable={false}>
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
                    <Layout.Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        gap="s"
                        wrap="wrap"
                        class="u-width-full-line actions-mobile">
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
                    </Layout.Stack>
                {:else}
                    <Layout.Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        gap="s"
                        wrap="wrap"
                        class="u-width-full-line actions-mobile">
                        {#if $organization?.billingPlanDowngrade !== null}
                            <Button text on:click={() => (showCancel = true)}>Cancel change</Button>
                        {:else}
                            <Button
                                text
                                disabled={$organization?.markedForDeletion}
                                href={$upgradeURL}
                                on:click={() =>
                                    trackEvent(Click.OrganizationClickUpgrade, {
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
                    </Layout.Stack>
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
