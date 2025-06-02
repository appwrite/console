<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { AvatarGroup, Tab, Tabs } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { daysLeftInTrial, getServiceLimit, plansInfo, readOnly } from '$lib/stores/billing';
    import { members, newMemberModal, organization } from '$lib/stores/organization';
    import {
        canSeeBilling,
        canSeeProjects,
        canSeeTeams,
        isBilling,
        isOwner
    } from '$lib/stores/roles';
    import { GRACE_PERIOD_OVERRIDE, isCloud, isStudio } from '$lib/system';
    import { IconGithub, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Tooltip, Typography, Layout, Badge } from '@appwrite.io/pink-svelte';

    let areMembersLimited: boolean;
    $: organization.subscribe(() => {
        const limit = getServiceLimit('members') || Infinity;
        const isLimited = limit !== 0 && limit < Infinity;
        areMembersLimited =
            isCloud &&
            (($readOnly && !GRACE_PERIOD_OVERRIDE) || (isLimited && $members?.total >= limit));
    });

    $: avatars = $members.memberships?.map((m) => m.userName || m.userEmail) ?? [];
    $: organizationId = $organization?.$id ?? page.params.organization;
    $: path = `${base}/organization-${organizationId}`;
    $: tabs = [
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
            disabled: !(isCloud && ($isOwner || $isBilling))
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
    ].filter((tab) => !tab.disabled);
</script>

{#if $organization.$id && !isStudio}
    <Cover>
        <svelte:fragment slot="header">
            <span class="u-flex u-cross-center u-gap-8 u-min-width-0">
                <Typography.Title color="--fgcolor-neutral-primary" size="xl" truncate>
                    {$organization.name}
                </Typography.Title>
                {#if isCloud && $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                    <Badge variant="secondary" content="Education">
                        <Icon icon={IconGithub} size="s" slot="start" />
                    </Badge>
                {:else if isCloud && $organization?.billingPlan === BillingPlan.FREE}
                    <Badge variant="secondary" content="Free"></Badge>
                {/if}
                {#if isCloud && $organization?.billingTrialStartDate && $daysLeftInTrial > 0 && $organization.billingPlan !== BillingPlan.FREE && $plansInfo.get($organization.billingPlan)?.trialDays}
                    <Tooltip>
                        <Badge variant="secondary" content="Trial" />
                        <svelte:fragment slot="tooltip">
                            {`Your trial ends on ${toLocaleDate(
                                $organization.billingStartDate
                            )}. ${$daysLeftInTrial} days remaining.`}
                        </svelte:fragment>
                    </Tooltip>
                {/if}
            </span>
            <div class="u-margin-inline-start-auto">
                <Layout.Stack direction="row" alignItems="center" gap="xl">
                    {#if $members.total > 1}
                        <a href={`${path}/members`} class="is-not-mobile">
                            <AvatarGroup size="xs" {avatars} total={$members?.total ?? 0} />
                        </a>
                    {/if}

                    {#if $isOwner}
                        <Button
                            secondary
                            size="s"
                            on:click={() => newMemberModal.set(true)}
                            disabled={areMembersLimited}>
                            <Icon icon={IconPlus} size="s" slot="start" />
                            Invite
                        </Button>
                    {/if}
                </Layout.Stack>
            </div>
        </svelte:fragment>
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
    </Cover>
{/if}
