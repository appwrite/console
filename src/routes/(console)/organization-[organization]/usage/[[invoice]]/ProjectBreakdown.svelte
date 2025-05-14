<script lang="ts">
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import { canSeeProjects } from '$lib/stores/roles';
    import { onMount } from 'svelte';
    import { Accordion, Table } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';

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

    export let data;
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
    <Accordion title="Project breakdown" hideDivider>
        <Table.Root
            columns={[
                { id: 'project' },
                { id: 'reads', hide: !databaseOperationMetric },
                { id: 'writes', hide: !databaseOperationMetric },
                { id: 'metric', hide: !!databaseOperationMetric },
                { id: 'costs' }
            ]}
            let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="project" {root}>Project</Table.Header.Cell>
                <Table.Header.Cell column="reads" {root}>Reads</Table.Header.Cell>
                <Table.Header.Cell column="writes" {root}>Writes</Table.Header.Cell>
                <Table.Header.Cell column="metric" {root}
                    >{getMetricTitle(metric)}</Table.Header.Cell>
                <Table.Header.Cell column="costs" {root}>Estimated cost</Table.Header.Cell>
            </svelte:fragment>
            {#each groupByProject(metric, estimate, databaseOperationMetric).sort((a, b) => {
                const aValue = a.usage ?? a.databasesReads ?? 0;
                const bValue = b.usage ?? b.databasesReads ?? 0;
                return bValue - aValue;
            }) as project}
                {#if !$canSeeProjects}
                    <Table.Row.Base {root}>
                        <Table.Cell column="project" {root}>
                            {data.projectNames[project.projectId]?.name ?? 'Unknown'}
                        </Table.Cell>
                        <Table.Cell column="reads" {root}>
                            {format(project.databasesReads ?? 0)}
                        </Table.Cell>
                        <Table.Cell column="writes" {root}>
                            {format(project.databasesWrites ?? 0)}
                        </Table.Cell>
                        <Table.Cell column="metric" {root}>
                            {format(project.usage)}
                        </Table.Cell>
                        <Table.Cell column="costs" {root}>
                            {formatCurrency(project.estimate ?? 0)}
                        </Table.Cell>
                    </Table.Row.Base>
                {:else}
                    <Table.Row.Link href={getProjectUsageLink(project.projectId)} {root}>
                        <Table.Cell column="project" {root}>
                            {data.projectNames[project.projectId]?.name ?? 'Unknown'}
                        </Table.Cell>
                        <Table.Cell column="reads" {root}>
                            {format(project.databasesReads ?? 0)}
                        </Table.Cell>
                        <Table.Cell column="writes" {root}>
                            {format(project.databasesWrites ?? 0)}
                        </Table.Cell>
                        <Table.Cell column="metric" {root}>
                            {format(project.usage)}
                        </Table.Cell>
                        <Table.Cell column="costs" {root}>
                            {formatCurrency(project.estimate ?? 0)}
                        </Table.Cell>
                    </Table.Row.Link>
                {/if}
            {/each}
        </Table.Root>
    </Accordion>
{/if}
