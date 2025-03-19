<script lang="ts">
    import { Card, Layout, Button } from '@appwrite.io/pink-svelte';
    import type { RegionList } from '$lib/sdk/billing';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { Flag, ID, Region } from '@appwrite.io/console';
    import Loading from './loading.svelte';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { addNotification } from '$lib/stores/notifications';
    import { tierToPlan } from '$lib/stores/billing';
    import CreateProject from '$lib/layout/createProject.svelte';

    let isLoading = false;
    let id: string;
    let startAnimation = false;
    let projectName = '';
    let region = Region.Default;
    export let data: { regions: RegionList | null };

    async function createProject() {
        isLoading = true;

        let org;
        try {
            org = isCloud
                ? await sdk.forConsole.billing.createOrganization(
                      ID.unique(),
                      'Personal projects',
                      BillingPlan.FREE,
                      null,
                      null
                  )
                : await sdk.forConsole.teams.create(ID.unique(), 'Personal projects');
        } catch (e) {
            isLoading = false;
            trackError(e, Submit.OrganizationCreate);
            addNotification({
                type: 'error',
                message: e.message
            });
        }

        trackEvent(Submit.OrganizationCreate, {
            plan: tierToPlan(BillingPlan.FREE)?.name,
            budget_cap_enabled: false,
            members_invited: 0
        });

        if (org) {
            const teamId = org.$id;
            try {
                const project = await sdk.forConsole.projects.create(
                    id ?? ID.unique(),
                    projectName,
                    teamId,
                    region
                );
                trackEvent(Submit.ProjectCreate, {
                    customId: !!id,
                    teamId
                });

                startAnimation = true;

                trackEvent(Submit.ProjectCreate, {
                    teamId: teamId
                });

                setTimeout(async () => {
                    await invalidate(Dependencies.ACCOUNT);
                    goto(`${base}/project-${project.$id}`);
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
    }
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
                regions={isCloud ? data.regions.regions : []}
                bind:projectName
                bind:id
                bind:region>
                <svelte:fragment slot="submit"
                    ><Layout.Stack direction="row" justifyContent="flex-end"
                        ><Button.Button
                            type="button"
                            variant="primary"
                            size="s"
                            on:click={createProject}>
                            Create</Button.Button>
                    </Layout.Stack></svelte:fragment>
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
