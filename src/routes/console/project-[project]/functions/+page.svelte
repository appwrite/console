<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        CardContainer,
        GridItem1,
        Heading,
        PaginationWithLimit,
        Id,
        DropList,
        DropListItem
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import CreateManual from '$lib/wizards/functions/createManual.svelte';
    import CreateGit from '$lib/wizards/functions/createGit.svelte';
    import CreateStarter from '$lib/wizards/functions/createStarter.svelte';

    export let data;

    let offset = 0;
    let showCreateDropdown = false;

    const project = $page.params.project;

    function openWizard() {
        wizard.start(CreateManual);
    }

    beforeNavigate(() => {
        wizard.hide();
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Functions</Heading>
        <DropList bind:show={showCreateDropdown} scrollable>
            <slot>
                <Button
                    on:click={() => (showCreateDropdown = !showCreateDropdown)}
                    event="create_attribute">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create function</span>
                </Button>
            </slot>
            <svelte:fragment slot="list">
                <DropListItem on:click={() => wizard.start(CreateManual)}>Manual</DropListItem>
                <DropListItem on:click={() => wizard.start(CreateGit)}>Git</DropListItem>
                <DropListItem on:click={() => wizard.start(CreateStarter)}
                    >Starter template</DropListItem>
            </svelte:fragment>
        </DropList>
    </div>

    {#if data.functions.total}
        <CardContainer
            {offset}
            event="functions"
            total={data.functions.total}
            on:click={openWizard}>
            {#each data.functions.functions as func}
                <GridItem1
                    href={`${base}/console/project-${project}/functions/function-${func.$id}`}>
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
                        {#if func.scheduleNext}
                            <li>
                                <span
                                    class="icon-clock"
                                    aria-hidden="true"
                                    use:tooltip={{
                                        content: `Next execution: 
                                        ${toLocaleDateTime(func.scheduleNext)}`
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

        <PaginationWithLimit
            name="Functions"
            limit={data.limit}
            offset={data.offset}
            total={data.functions.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/functions#deployFunction"
            target="function"
            on:click={openWizard} />
    {/if}
</Container>
