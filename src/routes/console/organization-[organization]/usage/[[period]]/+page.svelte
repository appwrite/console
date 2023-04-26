<script lang="ts">
    import { Container } from '$lib/layout';
    import { Heading, ProjectUsage } from '$lib/components';
    import type { PageData } from './$types';

    export let data: PageData;
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
        {#each data?.usageData as project}
            <ProjectUsage title={project?.name} data={project?.projectUsage} />
        {/each}
    </ul>
</Container>
