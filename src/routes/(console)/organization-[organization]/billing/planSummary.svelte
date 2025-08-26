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
    import CancelDowngradeModel from './cancelDowngradeModal.svelte';

    export let currentPlan: Plan;
    export let currentInvoice: Invoice | undefined = undefined;
    export let currentAggregation: AggregationTeam | undefined = undefined;
    export let availableCredit: number | undefined = undefined;
    export let organizationUsage: any = undefined;
    export let usageProjects: Record<string, any> = {};

    $: {
        currentAggregation;
        availableCredit;
        organizationUsage;
        usageProjects;
    }

    let showCancel: boolean = false;

    // define columns for the expandable table
    const columns = [
        { id: 'item', align: 'left' as const, width: '20fr' },
        { id: 'usage', align: 'left' as const, width: '20fr' },
        { id: 'price', align: 'right' as const, width: '0fr' }
    ];

    $: projectIdToBreakdown = new Map(
        (currentAggregation?.projectBreakdown || []).map((p) => [p.$id, p])
    );

    function formatHumanSize(bytes: number): string {
        const size = humanFileSize(bytes || 0);
        return `${size.value} ${size.unit}`;
    }

    function resourceEntry(p: any, id: string): any {
        const res = p?.resources;
        if (!res) return undefined;
        if (Array.isArray(res)) {
            return res.find((r: any) => r.resourceId === id);
        }
        return res[id];
    }
    function valueOf(p: any, id: string): number {
        const entry = resourceEntry(p, id);
        return (entry?.value ?? 0) as number;
    }
    function amountOf(p: any, id: string): number {
        const entry = resourceEntry(p, id);
        return (entry?.amount ?? 0) as number;
    }
    function storageTotal(p: any): number {
        const ids = [
            'filesStorage',
            'deploymentsStorage',
            'buildsStorage',
            'backupsStorage',
            'databasesStorage'
        ];
        return ids.reduce((sum, rid) => sum + (valueOf(p, rid) || 0), 0);
    }

    $: projectsList = organizationUsage?.projects?.length
        ? organizationUsage.projects
        : (currentAggregation?.projectBreakdown || []).map((p) => ({
              projectId: p.$id,
              storage: storageTotal(p),
              executions: valueOf(p, 'executions'),
              executionsMBSeconds: 0,
              bandwidth: valueOf(p, 'bandwidth'),
              databasesReads: valueOf(p, 'databasesReads'),
              databasesWrites: valueOf(p, 'databasesWrites'),
              users: valueOf(p, 'users'),
              authPhoneTotal: valueOf(p, 'authPhone'),
              authPhoneEstimate: amountOf(p, 'authPhone')
          }));

    $: billingData = [
        {
            id: 'base-plan',
            expandable: false,
            cells: {
                item: 'Base plan',
                usage: '',
                price: formatCurrency(currentPlan?.price || 0)
            }
        },
        ...(projectsList?.map((project) => ({
            id: `project-${project.projectId}`,
            expandable: true,
            cells: {
                item: usageProjects[project.projectId]?.name || `Project ${project.projectId}`,
                usage: '',
                price: formatCurrency(projectIdToBreakdown.get(project.projectId)?.amount || 0)
            },
            children: [
                // Bandwidth
                {
                    id: `project-${project.projectId}-bandwidth`,
                    cells: {
                        item: 'Bandwidth',
                        usage: `${project.bandwidth?.toLocaleString() || 0} / ${currentPlan?.bandwidth?.toLocaleString() || '∞'}`,
                        price: formatCurrency(0)
                    }
                },
                // Users
                {
                    id: `project-${project.projectId}-users`,
                    cells: {
                        item: 'Users',
                        usage: `${project.users?.toLocaleString() || 0} / ${currentPlan?.users?.toLocaleString() || '∞'}`,
                        price: formatCurrency(0)
                    }
                },
                // Database reads
                {
                    id: `project-${project.projectId}-reads`,
                    cells: {
                        item: 'Database reads',
                        usage: `${project.databasesReads?.toLocaleString() || 0} / ∞`,
                        price: formatCurrency(0)
                    }
                },
                // Database writes
                {
                    id: `project-${project.projectId}-writes`,
                    cells: {
                        item: 'Database writes',
                        usage: `${project.databasesWrites?.toLocaleString() || 0} / ∞`,
                        price: formatCurrency(0)
                    }
                },
                // Executions
                {
                    id: `project-${project.projectId}-executions`,
                    cells: {
                        item: 'Executions',
                        usage: `${project.executions?.toLocaleString() || 0} / ${currentPlan?.executions?.toLocaleString() || '∞'}`,
                        price: formatCurrency(0)
                    }
                },
                // Storage
                {
                    id: `project-${project.projectId}-storage`,
                    cells: {
                        item: 'Storage',
                        usage: `${formatHumanSize(project.storage || 0)} / ${currentPlan?.storage?.toString() || '0'} GB`,
                        price: formatCurrency(0)
                    }
                },
                // GB-hours (executions time)
                {
                    id: `project-${project.projectId}-gb-hours`,
                    cells: {
                        item: 'GB-hours',
                        usage: `${((project.executionsMBSeconds || 0) / 1000 / 3600).toFixed(0)} / ${currentPlan?.executions ? ((currentPlan.executions * 1000 * 3600) / 1000 / 3600).toFixed(0) : '∞'}`,
                        price: formatCurrency(0)
                    }
                },
                // Phone OTP
                ...(project.authPhoneTotal
                    ? [
                          {
                              id: `project-${project.projectId}-sms`,
                              cells: {
                                  item: 'Phone OTP',
                                  usage: `${project.authPhoneTotal?.toLocaleString() || 0} SMS messages`,
                                  price: formatCurrency(project.authPhoneEstimate || 0)
                              }
                          }
                      ]
                    : []),
                // Usage details link
                {
                    id: `project-${project.projectId}-usage-details`,
                    cells: {
                        item: `<a href="${base}/project-${usageProjects[project.projectId]?.region || 'default'}-${project.projectId}/settings/usage" style="text-decoration: underline; font-weight: bold; color: var(--fgcolor-neutral-primary);">Usage details</a>`,
                        usage: '',
                        price: ''
                    }
                }
            ]
        })) || []),
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
                      }
                  }
              ]
            : [])
    ];

    $: totalAmount = billingData.reduce((sum, item) => {
        const itemPrice = parseFloat(item.cells.price.replace(/[^0-9.-]+/g, ''));
        const childrenPrice =
            item.children?.reduce((childSum, child) => {
                const childPrice = parseFloat(child.cells.price.replace(/[^0-9.-]+/g, ''));
                return childSum + childPrice;
            }, 0) || 0;
        return sum + itemPrice + childrenPrice;
    }, 0);
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
                            <Typography.Text>
                                {row.cells?.[col.id] ?? ''}
                            </Typography.Text>
                        </ExpandableTable.Cell>
                    {/each}

                    <svelte:fragment slot="summary">
                        {#if row.children}
                            {#each row.children as child (child.id)}
                                <div
                                    class="child-row"
                                    style="grid-template-columns: {root.childGridTemplate};">
                                    {#each columns as col}
                                        <div
                                            class="child-cell"
                                            style="justify-content: {root.alignment(col.align)};">
                                            {#if child.cells?.[col.id]?.includes('<a href=')}
                                                {@html child.cells?.[col.id] ?? ''}
                                            {:else}
                                                <Typography.Text
                                                    variant="m-400"
                                                    color="--fgcolor-neutral-primary">
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

        <!-- Actions -->
        <div class="actions-container">
            {#if $organization?.billingPlan === BillingPlan.FREE || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                <div
                    class="u-flex u-flex-vertical-mobile u-cross-center u-gap-16 u-flex-wrap u-width-full-line u-main-end">
                    <Button text href={`${base}/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
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
                    class="u-flex u-flex-vertical-mobile u-cross-center u-gap-16 u-flex-wrap u-width-full-line u-main-end">
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
                    <Button secondary href={`${base}/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
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

    @media (max-width: 768px) {
        .billing-cycle-header {
            flex-direction: column;
            gap: 8px;
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
