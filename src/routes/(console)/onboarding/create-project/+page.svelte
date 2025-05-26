<script lang="ts">
    import { Card, Layout, Button } from '@appwrite.io/pink-svelte';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Region } from '@appwrite.io/console';
    import Loading from './loading.svelte';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { addNotification } from '$lib/stores/notifications';
    import CreateProject from '$lib/layout/createProject.svelte';
    import { loadAvailableRegions } from '$routes/(console)/regions';
    import { regions as regionsStore } from '$lib/stores/organization';

    let isLoading = false;
    let id: string;
    let startAnimation = false;
    let projectName = 'Appwrite project';
    let region = Region.Fra;
    export let data;

    async function createProject() {
        isLoading = true;

        try {
            const teamId = data.organization.$id;
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                projectName,
                teamId,
                isCloud ? region : undefined
            );
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId
            });

            startAnimation = true;

            setTimeout(async () => {
                await invalidate(Dependencies.ACCOUNT);
                goto(`${base}/project-${project.region ?? 'default'}-${project.$id}`);
            }, 3000);
        } catch (e) {
            trackError(e, Submit.ProjectCreate);
            isLoading = false;
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    // safe side!
    loadAvailableRegions(data.organization.$id);
</script>

<svelte:head>
    <title>Create project - Appwrite</title>
</svelte:head>
<div
    class="page-container u-flex-vertical u-cross-child-center u-cross-center"
    class:u-margin-block-start-96={!isLoading}>
    {#if isLoading}
        <Loading {startAnimation} />
    {:else}
        <img
            src="/console/images/appwrite-logo-light.svg"
            width="120"
            height="22"
            class="u-only-light"
            alt="Appwrite Logo" />
        <img
            src="/console/images/appwrite-logo-dark.svg"
            width="120"
            height="22"
            class="u-only-dark"
            alt="Appwrite Logo" />
        <Card.Base variant="primary" padding="l">
            <CreateProject
                regions={$regionsStore.regions}
                bind:projectName
                bind:id
                bind:region
                on:submit={createProject}>
                <svelte:fragment slot="submit">
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Button.Button autofocus type="submit" variant="primary" size="s">
                            Create
                        </Button.Button>
                    </Layout.Stack>
                </svelte:fragment>
            </CreateProject>
        </Card.Base>
    {/if}
</div>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    :global(body) {
        background: var(--bgcolor-neutral-default, #19191c);
    }
    .page-container {
        width: calc(100% - 2rem);
        margin: 0 1rem;
        gap: 4.5rem;
        background: var(--bgcolor-neutral-default, #19191c);

        @media #{devices.$break2open} {
            width: 700px;
        }
    }
</style>
