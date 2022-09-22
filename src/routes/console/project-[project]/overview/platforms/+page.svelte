<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import Create from './create.svelte';

    let show = false;

    const path = `/console/project-${$page.params.project}/overview/platforms`;

    onMount(handle);
    afterNavigate(handle);

    function handle(navigate = null) {
        updateLayout({
            navigate,
            title: $project.name,
            level: 3,
            breadcrumbs: {
                href: 'platforms',
                title: 'Platforms'
            }
        });
    }
</script>

<h3 class="heading-level-7">
    Platforms
    <Button on:click={() => (show = true)}>Add Platform</Button>
</h3>
<ul class="grid-box u-margin-block-start-32" style="--grid-gap:2rem; --grid-item-size:25rem;">
    {#each $project.platforms as platform}
        <li class="card">
            <a class="grid-item-1" href={`${path}/${platform.$id}`}>
                <div class="grid-item-1-start-start">
                    <h2 class="heading-level-6 u-margin-block-start-8">{platform.name}</h2>
                </div>

                <div class="grid-item-1-end-start">
                    <p>Last Updated</p>
                    <p>{toLocaleDateTime(platform.$updatedAt)}</p>
                </div>
            </a>
        </li>
    {/each}
</ul>
<Create bind:show />
