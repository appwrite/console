<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { AvatarGroup, Tab, Tabs } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import {
        daysLeftInTrial,
        getServiceLimit,
        plansInfo,
        readOnly,
        tierToPlan
    } from '$lib/stores/billing';
    import { members, newMemberModal, type Organization } from '$lib/stores/organization';
    import {
        canSeeBilling,
        canSeeProjects,
        canSeeTeams,
        isBilling,
        isOwner
    } from '$lib/stores/roles';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { IconGithub, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    let areMembersLimited: boolean = $state(false);

    $effect(() => {
        const limit = getServiceLimit('members', null, page.data.currentPlan) || Infinity;
        const isLimited = limit !== 0 && limit < Infinity;
        areMembersLimited =
            isCloud &&
            (($readOnly && !GRACE_PERIOD_OVERRIDE) || (isLimited && $members?.total >= limit));
    });

    const organization = $derived(page.data.organization as Organization);
    const path = $derived(`${base}/organization-${organization.$id}`);

    const tabs = $derived(
        [
            {
                href: path,
                title: 'Projects',
                event: 'projects',
                hasChildren: true,
                disabled: !$canSeeProjects
            },
            {
                href: `${path}/domains`,
                event: 'domains',
                title: 'Domains',
                disabled: !isCloud
            },
            {
                href: `${path}/members`,
                title: 'Members',
                event: 'members',
                hasChildren: true,
                disabled: !$canSeeTeams
            },
            {
                href: `${path}/usage`,
                event: 'usage',
                title: 'Usage',
                hasChildren: true,
                disabled: !(
                    isCloud &&
                    ($isOwner || $isBilling) &&
                    !page.data.currentPlan?.usagePerProject
                )
            },
            {
                href: `${path}/billing`,
                event: 'billing',
                title: 'Billing',
                disabled: !(isCloud && $canSeeBilling)
            },
            {
                href: `${path}/settings`,
                event: 'settings',
                title: 'Settings',
                disabled: !$isOwner
            }
        ].filter((tab) => !tab.disabled)
    );

    const avatars = $derived($members.memberships?.map((m) => m.userName || m.userEmail) ?? []);

    const titleName = $derived.by(() => {
        if (!resolvedProfile.minimalOrgHeader) {
            return organization?.name;
        }

        const currentPath = page.url.pathname;
        const matchedTab = tabs.find((tab) => isTabSelected(tab, currentPath, path, tabs));
        return matchedTab?.title ?? organization?.name ?? 'Organization';
    });

    const shouldShowCover = $derived(resolvedProfile.minimalOrgHeader ? true : organization.$id);
</script>

{#if shouldShowCover}
    <Cover blocksize="152px">
        <svelte:fragment slot="header">
            <span class="u-flex u-cross-center u-gap-8 u-min-width-0">
                <Typography.Title color="--fgcolor-neutral-primary" size="xl" truncate>
                    {titleName}
                </Typography.Title>

                {#if !resolvedProfile.minimalOrgHeader}
                    {#if isCloud && organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                        <Badge variant="secondary" content="Education">
                            <Icon icon={IconGithub} size="s" slot="start" />
                        </Badge>
                    {:else if isCloud && organization?.billingPlan === BillingPlan.FREE}
                        <Badge variant="secondary" content="Free"></Badge>
                    {/if}

                    {#if isCloud && organization?.billingTrialStartDate && $daysLeftInTrial > 0 && organization.billingPlan !== BillingPlan.FREE && $plansInfo.get(organization.billingPlan)?.trialDays}
                        <Tooltip>
                            <Badge variant="secondary" content="Trial" />
                            <svelte:fragment slot="tooltip">
                                {`Your trial ends on ${toLocaleDate(
                                    organization.billingStartDate
                                )}. ${$daysLeftInTrial} days remaining.`}
                            </svelte:fragment>
                        </Tooltip>
                    {/if}
                {/if}
            </span>

            <div class="u-margin-inline-start-auto">
                <Layout.Stack direction="row" alignItems="center" gap="xl">
                    {#if $members.total > 1}
                        <a href={`${path}/members`} class="is-not-mobile">
                            <AvatarGroup size="xs" {avatars} total={$members?.total ?? 0} />
                        </a>
                    {/if}

                    {#if $isOwner && !resolvedProfile.minimalOrgHeader}
                        <Tooltip disabled={!areMembersLimited} placement="bottom-end">
                            <div>
                                <Button
                                    secondary
                                    size="s"
                                    on:click={() => newMemberModal.set(true)}
                                    disabled={areMembersLimited}>
                                    <Icon icon={IconPlus} size="s" slot="start" />
                                    Invite
                                </Button>
                            </div>
                            <div slot="tooltip">
                                {organization?.billingPlan === BillingPlan.FREE
                                    ? 'Upgrade to add more members'
                                    : `You've reached the members limit for the ${
                                          tierToPlan(organization?.billingPlan)?.name
                                      } plan`}
                            </div>
                        </Tooltip>
                    {/if}
                </Layout.Stack>
            </div>
        </svelte:fragment>

        {#if resolvedProfile.minimalOrgHeader}
            <Tabs>
                <Tab selected event={titleName.toLowerCase()}>Overview</Tab>
            </Tabs>
        {:else}
            <Tabs>
                {#each tabs as tab}
                    <Tab
                        href={tab.href}
                        selected={isTabSelected(tab, page.url.pathname, path, tabs)}
                        event={tab.event}>
                        {tab.title}
                    </Tab>
                {/each}
            </Tabs>
        {/if}
    </Cover>
{/if}
