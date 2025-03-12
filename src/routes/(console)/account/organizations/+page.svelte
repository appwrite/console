<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import {
        AvatarGroup,
        CardContainer,
        Empty,
        GridItem1,
        Heading,
        PaginationWithLimit
    } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { daysLeftInTrial, plansInfo, tierToPlan } from '$lib/stores/billing';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import type { Models } from '@appwrite.io/console';
    import CreateOrganization from '../../createOrganization.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    let addOrganization = false;

    const getMemberships = async (teamId: string) => {
        const memberships = await sdk.forConsole.teams.listMemberships(teamId);
        return memberships.memberships.map((team) => team.userName || team.userEmail);
    };

    function isCloudOrg(
        data: Partial<Models.TeamList<Models.Preferences>> | Organization
    ): data is Organization {
        return isCloud && 'billingPlan' in data ? true : false;
    }

    function createOrg() {
        if (isCloud) {
            goto(`${base}/create-organization`);
        } else addOrganization = true;
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Organizations</Heading>

        <Button on:click={createOrg} event="create_organization">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create organization</span>
        </Button>
    </div>

    {#if data.organizations.teams.length}
        <CardContainer
            total={data.organizations.total}
            offset={data.offset}
            event="organization"
            on:click={createOrg}>
            {#each data.organizations.teams as organization}
                {@const avatarList = getMemberships(organization.$id)}
                <GridItem1 href={`${base}/organization-${organization.$id}`}>
                    <svelte:fragment slot="eyebrow">
                        {organization?.total ? organization?.total : 'No'} members
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        {organization.name}
                    </svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if isCloudOrg(organization)}
                            {#if organization?.billingPlan === BillingPlan.FREE || organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                                <div
                                    class="u-flex u-cross-center"
                                    use:tooltip={{
                                        content:
                                            'You are limited to 1 free organization per account'
                                    }}>
                                    <Pill class="eyebrow-heading-3"
                                        >{tierToPlan(organization?.billingPlan)?.name}</Pill>
                                </div>
                            {/if}
                            {#if organization?.billingTrialStartDate && $daysLeftInTrial > 0 && organization.billingPlan !== BillingPlan.FREE && $plansInfo.get(organization.billingPlan)?.trial}
                                <div
                                    class="u-flex u-cross-center"
                                    use:tooltip={{
                                        content: `Your trial ends on ${toLocaleDate(
                                            organization.billingStartDate
                                        )}. ${$daysLeftInTrial} days remaining.`
                                    }}>
                                    <Pill class="eyebrow-heading-3">TRIAL</Pill>
                                </div>
                            {/if}
                        {/if}
                    </svelte:fragment>
                    {#await avatarList}
                        <span class="avatar is-color-empty" />
                    {:then avatars}
                        <AvatarGroup size={40} {avatars} />
                    {/await}
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new organization</p>
            </svelte:fragment>
        </CardContainer>
    {:else}
        <Empty single on:click={createOrg}>
            <p>Create a new organization</p>
        </Empty>
    {/if}

    <PaginationWithLimit
        name="Organizations"
        limit={data.limit}
        offset={data.offset}
        total={data.organizations.total} />
</Container>

<CreateOrganization bind:show={addOrganization} />
