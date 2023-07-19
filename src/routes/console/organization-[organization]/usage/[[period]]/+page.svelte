<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Heading, ProgressBarBig, ProjectUsage } from '$lib/components';

    // export let data;
</script>

<Container>
    <Heading tag="h2" size="5">Usage</Heading>
    <div class="u-flex u-main-space-between common-section">
        <p class="text">
            Metrics are estimates updated every 24 hours and may not accurately reflect your
            invoice.
        </p>
        <div class="u-flex u-gap-8">
            <p class="text">Usage period:</p>

            JANUARY 2021
        </div>
    </div>
    <ul
        class="grid-box common-section u-margin-block-start-32"
        style="--grid-gap:1.5rem; --grid-item-size:25rem;'}">
        <!-- TODO: show correct data -->
        {#each [] as project}
            <ProjectUsage title={project?.name} data={project?.projectUsage} />
        {/each}
    </ul>

    <CardGrid>
        <Heading tag="h6" size="7">Function executions</Heading>

        <p class="text">
            Calculated for all functions that are executed in all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="executions" max={750000} used={125000} />
        </svelte:fragment>
    </CardGrid>
</Container>
