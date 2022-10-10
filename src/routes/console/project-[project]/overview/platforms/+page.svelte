<script lang="ts">
    import { page } from '$app/stores';
    import { GridItem1 } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '../../store';
    import Create from './create.svelte';

    let show = false;

    const path = `/console/project-${$page.params.project}/overview/platforms`;
</script>

<div class="common-section u-flex u-gap-12">
    <h3 class="heading-level-7">Platforms</h3>
    <span class="u-margin-inline-start-auto">
        <Button on:click={() => (show = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add Platform</span>
        </Button>
    </span>
</div>

<div class="grid-box u-margin-block-start-32" style="--grid-gap:2rem; --grid-item-size:25rem;">
    {#each $project.platforms as platform}
        <GridItem1 href={`${path}/${platform.$id}`}>
            <svelte:fragment slot="title">{platform.name}</svelte:fragment>

            <div class="grid-item-1-end-start">
                <p>Last Updated</p>
                <p>{toLocaleDateTime(platform.$updatedAt)}</p>
            </div>
        </GridItem1>
    {/each}
</div>

<Create bind:show />
