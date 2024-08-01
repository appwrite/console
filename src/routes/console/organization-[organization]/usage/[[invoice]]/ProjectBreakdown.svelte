<script lang="ts">
    import type { PageData } from './$types';
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import {
        TableBody,
        TableCellHead,
        TableHeader,
        TableScroll,
        TableRowLink,
        TableCell
    } from '$lib/elements/table';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { OrganizationUsage } from '$lib/sdk/billing';

    type Metric = 'users' | 'storage' | 'bandwidth' | 'executions';
    export let data: PageData;
    export let projects: OrganizationUsage['projects'];
    export let metric: Metric;

    function getProjectName(projectId: string): string {
        return data.projectNames.find((project) => project.$id === projectId)?.name;
    }

    function getProjectUsageLink(projectId: string): string {
        return `/console/project-${projectId}/settings/usage`;
    }

    function groupByProject(metric: Metric): Array<{ projectId: string; usage: number }> {
        const data = [];
        for (const project of projects) {
            const usage = project[metric];
            data.push({
                projectId: project.projectId,
                usage: usage ?? 0
            });
        }
        return data;
    }

    function format(value: number): string {
        const humanized = humanFileSize(value);
        switch (metric) {
            case 'executions':
            case 'users':
                return abbreviateNumber(value);
            case 'storage':
            case 'bandwidth':
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
                <TableCellHead />
            </TableHeader>
            <TableBody>
                {#each groupByProject(metric).sort((a, b) => b.usage - a.usage) as project}
                    <TableRowLink href={getProjectUsageLink(project.projectId)}>
                        <TableCell title="Project">
                            {getProjectName(project.projectId)}
                        </TableCell>
                        <TableCell title="Usage">{format(project.usage)}</TableCell>
                        <TableCell right={true}>
                            <span
                                class="icon-cheveron-right u-cross-child-center ignore-icon-rotate" />
                        </TableCell>
                    </TableRowLink>
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
