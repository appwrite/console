<script lang="ts">
    import type { PageData } from './$types';
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
    import { abbreviateNumber, formatCurrency } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import { base } from '$app/paths';
    import { canSeeProjects } from '$lib/stores/roles';

    type Metric = 'users' | 'storage' | 'bandwidth' | 'executions' | 'authPhoneTotal';
    type Estimate = 'authPhoneEstimate';

    export let data: PageData;
    export let projects: OrganizationUsage['projects'];
    export let metric: Metric;
    export let estimate: Estimate | undefined = undefined;

    function getProjectUsageLink(projectId: string): string {
        return `${base}/project-${projectId}/settings/usage`;
    }

    function groupByProject(
        metric: Metric,
        estimate?: Estimate
    ): Array<{ projectId: string; usage: number; estimate?: number }> {
        const data = [];
        for (const project of projects) {
            const usage = project[metric];
            if (!usage) {
                continue;
            }
            data.push({
                projectId: project.projectId,
                usage: usage ?? 0,
                estimate: estimate ? project[estimate] : undefined
            });
        }
        return data;
    }

    function format(value: number): string {
        switch (metric) {
            case 'authPhoneTotal':
            case 'executions':
            case 'users':
                return abbreviateNumber(value);
            case 'storage':
            case 'bandwidth':
                const humanized = humanFileSize(value);
                return humanized.value + humanized.unit;
        }
    }
</script>

<Collapsible>
    <CollapsibleItem>
        <svelte:fragment slot="title">Project breakdown</svelte:fragment>
        <TableScroll noMargin style="table-layout: auto">
            <TableHeader>
                <TableCellHead>Project</TableCellHead>
                <TableCellHead>Usage</TableCellHead>
                {#if estimate}
                    <TableCellHead>Estimated Cost</TableCellHead>
                {/if}
                {#if $canSeeProjects}
                    <TableCellHead />
                {/if}
            </TableHeader>
            <TableBody>
                {#each groupByProject(metric, estimate).sort((a, b) => b.usage - a.usage) as project}
                    {#if !$canSeeProjects}
                        <TableRow>
                            <TableCell title="Project">
                                {data.projectNames[project.projectId]?.name ?? 'Unknown'}
                            </TableCell>
                            <TableCell title="Usage">{format(project.usage)}</TableCell>
                            {#if project.estimate}
                                <TableCell title="Estimate"
                                    >{formatCurrency(project.estimate)}</TableCell>
                            {/if}
                        </TableRow>
                    {:else}
                        <TableRowLink href={getProjectUsageLink(project.projectId)}>
                            <TableCell title="Project">
                                {data.projectNames[project.projectId]?.name ?? 'Unknown'}
                            </TableCell>
                            <TableCell title="Usage">{format(project.usage)}</TableCell>
                            {#if project.estimate}
                                <TableCell title="Estimate"
                                    >{formatCurrency(project.estimate)}</TableCell>
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

<style>
    .ignore-icon-rotate {
        rotate: unset !important;
    }
</style>
