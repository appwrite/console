<script lang="ts">
    import { Layout, Typography, Accordion } from '@appwrite.io/pink-svelte';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import type { Models } from '@appwrite.io/console';

    type UsageProjectInfo = Pick<Models.Project, 'name' | 'region'>;

    export let projects: OrganizationUsage['projects'];
    export let usageProjects: Record<string, UsageProjectInfo> = {};
    export let currentPlan: any;
    export let currentAggregation: any;

    function getUsageCost(projectId: string): number {
        const projectBreakdown = currentAggregation?.projectBreakdown?.find(
            (p: any) => p.projectId === projectId
        );
        return projectBreakdown?.amount || 0;
    }
</script>

{#if projects && projects.length > 0}
    <Layout.Stack gap="none">
        {#each projects as project, index}
            {@const projectInfo = usageProjects[project.projectId]}
            {@const projectCost = getUsageCost(project.projectId)}
            {@const projectName = projectInfo?.name || 'Unknown Project'}
            {@const isLastItem = index === projects.length - 1}

            <Accordion title={projectName} hideDivider={isLastItem}>
                <svelte:fragment slot="end">
                    <Typography.Text class="price">{formatCurrency(projectCost)}</Typography.Text>
                </svelte:fragment>
                <Layout.Stack>
                    <div class="accordion-child">
                        <Typography.Text color="--fgcolor-neutral-primary"
                            >{projectName}</Typography.Text>
                        <Typography.Text class="price"
                            >{formatCurrency(projectCost)}</Typography.Text>
                    </div>
                </Layout.Stack>
            </Accordion>
        {/each}
    </Layout.Stack>
{:else}
    <Layout.Stack gap="s" alignItems="center" justifyContent="center">
        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
            No projects with usage data found
        </Typography.Text>
    </Layout.Stack>
{/if}

<style>
    .price {
        text-align: right;
        min-width: 80px;
    }

    .accordion-child {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0 0.75rem 2rem;
    }
</style>
