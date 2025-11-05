<script lang="ts">
    import { base } from '$app/paths';
    import {
        GridItem1,
        Empty,
        AvatarGroup,
        CardContainer,
        PaginationWithLimit
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateOrganization from '../../createOrganization.svelte';
    import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { isCloud } from '$lib/system';
    import { Badge } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import type { Organization } from '$lib/stores/organization';
    import { daysLeftInTrial, plansInfo, tierToPlan, type Tier } from '$lib/stores/billing';
    import { toLocaleDate } from '$lib/helpers/date';
    import { BillingPlan } from '$lib/constants';
    import { goto } from '$app/navigation';
    import { Icon, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    const {
        data
    }: {
        data: PageData;
    } = $props();

    let addOrganization = $state(false);

    async function getMemberships(teamId: string): Promise<string[]> {
        const memberships = await sdk.forConsole.teams.listMemberships({ teamId });
        return memberships.memberships.map((team) => team.userName || team.userEmail);
    }

    async function getPlanName(billingPlan: string | undefined): Promise<string> {
        if (!billingPlan) return 'Unknown';

        // For known plans, use tierToPlan
        const tierData = tierToPlan(billingPlan as Tier);

        // If it's not a custom plan or we got a non-custom result, return the name
        if (tierData.name !== 'Custom') {
            return tierData.name;
        }

        // For custom plans, fetch from API
        try {
            const plan = await sdk.forConsole.billing.getPlan(billingPlan);
            return plan.name;
        } catch (error) {
            // Fallback to 'Custom' if fetch fails
            return 'Custom';
        }
    }

    function isOrganizationOnTrial(organization: Organization): boolean {
        if (!organization?.billingTrialStartDate) return false;
        if ($daysLeftInTrial <= 0) return false;
        if (organization.billingPlan === BillingPlan.FREE) return false;

        return !!$plansInfo.get(organization.billingPlan)?.trialDays;
    }

    function isNonPayingOrganization(organization: Organization): boolean {
        return (
            organization?.billingPlan === BillingPlan.FREE ||
            organization?.billingPlan === BillingPlan.GITHUB_EDUCATION
        );
    }

    function isPayingOrganization(team: Models.Preferences | Organization): Organization | null {
        const isPayingOrganization =
            isCloudOrg(team) && !isOrganizationOnTrial(team) && !isNonPayingOrganization(team);

        if (isPayingOrganization) return team as Organization;
        else return null;
    }

    function isCloudOrg(
        data: Partial<Models.TeamList<Models.Preferences>> | Organization
    ): data is Organization {
        return isCloud && 'billingPlan' in data;
    }

    function createOrg() {
        if (isCloud) {
            goto(`${base}/create-organization`);
        } else addOrganization = true;
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Typography.Title>Organizations</Typography.Title>

        <Button on:click={createOrg} event="create_organization">
            <Icon icon={IconPlus} slot="start" size="s" />
            Create organization
        </Button>
    </div>

    {#if data.organizations.teams.length}
        <CardContainer
            event="organization"
            offset={data.offset}
            on:click={createOrg}
            disableEmpty={false}
            total={data.organizations.total}>
            {#each data.organizations.teams as organization}
                {@const avatarList = getMemberships(organization.$id)}
                {@const payingOrg = isPayingOrganization(organization)}
                {@const planName = isCloudOrg(organization)
                    ? getPlanName(organization.billingPlan)
                    : null}

                <GridItem1 href={`${base}/organization-${organization.$id}`}>
                    <svelte:fragment slot="eyebrow">
                        {organization?.total}
                        {organization?.total > 1 ? 'members' : 'member'}
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        {organization.name}
                    </svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if isCloudOrg(organization)}
                            {#if isNonPayingOrganization(organization)}
                                {#if planName}
                                    {#await planName then name}
                                        <Tooltip>
                                            <Badge size="xs" variant="secondary" content={name} />

                                            <span slot="tooltip">
                                                You are limited to 1 free organization per account
                                            </span>
                                        </Tooltip>
                                    {/await}
                                {/if}
                            {/if}

                            {#if isOrganizationOnTrial(organization)}
                                <Tooltip>
                                    <div class="u-flex u-cross-center">
                                        <Badge
                                            class="eyebrow-heading-3"
                                            variant="secondary"
                                            content="TRIAL" />
                                    </div>
                                    <span slot="tooltip"
                                        >{`Your trial ends on ${toLocaleDate(
                                            organization.billingStartDate
                                        )}. ${$daysLeftInTrial} days remaining.`}</span>
                                </Tooltip>
                            {/if}

                            {#if payingOrg}
                                {#await getPlanName(payingOrg.billingPlan) then name}
                                    <Badge
                                        size="xs"
                                        type="success"
                                        variant="secondary"
                                        content={name} />
                                {/await}
                            {/if}
                        {/if}
                    </svelte:fragment>
                    {#await avatarList}
                        <span class="avatar is-color-empty"></span>
                    {:then avatars}
                        <AvatarGroup {avatars} />
                    {/await}
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new organization</p>
            </svelte:fragment>
        </CardContainer>
    {:else}
        <Empty single on:click={createOrg} target="organization">
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
