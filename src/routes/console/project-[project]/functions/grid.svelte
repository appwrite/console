<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import type { PageData } from './$types';
    import { app } from '$lib/stores/app';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { tooltip } from '$lib/actions/tooltip';

    export let data: PageData;
    export let offset = 0;
    export let openWizard;

    // let showCreate = false;

    const project = $page.params.project;
</script>

<CardContainer {offset} event="functions" total={data.functions.total} on:click={openWizard}>
    {#each data.functions.functions as func}
        <GridItem1 href={`${base}/console/project-${project}/functions/function-${func.$id}`}>
            <svelte:fragment slot="title">
                <div class="u-flex u-gap-16 u-cross-center">
                    <div class="avatar is-medium">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <span class="text">{func.name}</span>
                </div>
            </svelte:fragment>
            <svelte:fragment slot="icons">
                {#if func.schedule}
                    <li>
                        <span
                            class="icon-clock"
                            aria-hidden="true"
                            use:tooltip={{
                                content: `Next execution: 
                            ${toLocaleDateTime(func.schedule)}`
                            }} />
                    </li>
                {/if}
            </svelte:fragment>
            <Id value={func.$id} event="function">{func.$id}</Id>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a new function</p>
    </svelte:fragment>
</CardContainer>
