<script lang="ts">
    import { base } from '$app/paths';
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import { canSeeProjects } from '$lib/stores/roles';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    type Metric =
        | 'users'
        | 'storage'
        | 'bandwidth'
        | 'executions'
        | 'authPhoneTotal'
        | 'databasesReads'
        | 'databasesWrites'
        | 'imageTransformations';

    type Estimate = 'authPhoneEstimate';

    type DatabaseOperationMetric = Extract<Metric, 'databasesReads' | 'databasesWrites'>;

    export let data: PageData;
    export let projects: OrganizationUsage['projects'];
    export let metric: Metric | undefined = undefined;
    export let estimate: Estimate | undefined = undefined;
    export let databaseOperationMetric: DatabaseOperationMetric[] | undefined = undefined;

    function getMetricTitle(metric: Metric): string {
        switch (metric) {
            case 'authPhoneTotal':
                return 'Amount';
            default:
                return 'Usage';
        }
    }

    function getProjectUsageLink(projectId: string): string {
        const region = data.projects[projectId]?.region ?? 'fra';
        return `${base}/project-${region}-${projectId}/settings/usage`;
    }

    function getProjectName(projectId: string): string {
        return data.projects[projectId]?.name ?? 'Unknown';
    }

    function groupByProject(
        metric: Metric | undefined,
        estimate?: Estimate,
        databaseOps?: DatabaseOperationMetric[]
    ): Array<{
        projectId: string;
        databasesReads?: number;
        databasesWrites?: number;
        usage?: number;
        estimate?: number;
    }> {
        const data = [];
        for (const project of projects) {
            const projectId = project.projectId;

            if (metric) {
                const usage = project[metric];
                if (!usage) continue;

                data.push({
                    projectId,
                    usage: usage ?? 0,
                    estimate: estimate ? project[estimate] : undefined
                });
            } else if (databaseOps) {
                const reads = project['databasesReads'] ?? 0;
                const writes = project['databasesWrites'] ?? 0;

                if (reads || writes) {
                    data.push({
                        projectId,
                        databasesReads: reads,
                        databasesWrites: writes
                    });
                }
            }
        }
        return data;
    }

    function format(value: number): string {
        if (databaseOperationMetric) {
            return abbreviateNumber(value);
        }

        switch (metric) {
            case 'imageTransformations':
            case 'authPhoneTotal':
                return formatNumberWithCommas(value);
            case 'executions':
            case 'users':
                return abbreviateNumber(value);
            case 'storage':
            case 'bandwidth':
                return humanFileSize(value).value + humanFileSize(value).unit;
        }
    }

    onMount(() => {
        if (metric === undefined && databaseOperationMetric === undefined) {
            throw new Error(`metric or database operations must be defined`);
        }
    });
</script>

{#if projects.some((project) => project[metric]) || projects.some( (project) => databaseOperationMetric?.some((metric) => project[metric]) )}
    <Collapsible>
        <CollapsibleItem>
            <svelte:fragment slot="title">Project breakdown</svelte:fragment>
            <TableScroll dense noStyles noMargin style="table-layout: auto">
                <TableHeader>
                    <TableCellHead>Project</TableCellHead>
                    {#if databaseOperationMetric}
                        <TableCellHead>Reads</TableCellHead>
                        <TableCellHead>Writes</TableCellHead>
                    {:else}
                        <TableCellHead>{getMetricTitle(metric)}</TableCellHead>
                    {/if}

                    {#if estimate}
                        <TableCellHead>Estimated cost</TableCellHead>
                    {/if}
                    {#if $canSeeProjects}
                        <TableCellHead />
                    {/if}
                </TableHeader>
                <TableBody>
                    {#each groupByProject(metric, estimate, databaseOperationMetric).sort( (a, b) => {
                            const aValue = a.usage ?? a.databasesReads ?? 0;
                            const bValue = b.usage ?? b.databasesReads ?? 0;
                            return bValue - aValue;
                        } ) as project}
                        {#if !$canSeeProjects}
                            <TableRow>
                                <TableCell title="Project">
                                    {getProjectName(project.projectId)}
                                </TableCell>
                                {#if databaseOperationMetric}
                                    <TableCell title="Reads">
                                        {format(project.databasesReads ?? 0)}
                                    </TableCell>
                                    <TableCell title="Writes">
                                        {format(project.databasesWrites ?? 0)}
                                    </TableCell>
                                {:else}
                                    <TableCell>
                                        {format(project.usage)}
                                    </TableCell>
                                {/if}

                                {#if project.estimate}
                                    <TableCell title="Estimated cost">
                                        {formatCurrency(project.estimate)}
                                    </TableCell>
                                {/if}
                            </TableRow>
                        {:else}
                            <TableRowLink href={getProjectUsageLink(project.projectId)}>
                                <TableCell title="Project">
                                    {getProjectName(project.projectId)}
                                </TableCell>
                                {#if databaseOperationMetric}
                                    <TableCell title="Reads">
                                        {format(project.databasesReads ?? 0)}
                                    </TableCell>
                                    <TableCell title="Writes">
                                        {format(project.databasesWrites ?? 0)}
                                    </TableCell>
                                {:else}
                                    <TableCell>
                                        {format(project.usage)}
                                    </TableCell>
                                {/if}

                                {#if project.estimate}
                                    <TableCell title="Estimated cost">
                                        {formatCurrency(project.estimate)}
                                    </TableCell>
                                {/if}
                                <TableCell right={true}>
                                    <span
                                        class="icon-cheveron-right u-cross-child-center ignore-icon-rotate" />
                                </TableCell>
                            </TableRowLink>
                        {/if}
                    {/each}
                </TableBody>
            </TableScroll>
        </CollapsibleItem>
    </Collapsible>
{/if}

<style>
    .ignore-icon-rotate {
        rotate: unset !important;
    }
</style>
