<script lang="ts">
    import { goto } from '$app/navigation';
    import { base, resolve } from '$app/paths';
    import { page } from '$app/state';
    import { AvatarGroup, Tab, Tabs } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { daysLeftInTrial, getServiceLimit, readOnly } from '$lib/stores/billing';
    import { members, newMemberModal, newOrgModal } from '$lib/stores/organization';
    import {
        canSeeBilling,
        canSeeProjects,
        canSeeTeams,
        isBilling,
        isOwner
    } from '$lib/stores/roles';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { IconPlus, IconPlusSm } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';
    import { IconsMap } from '$lib/helpers/program';

    let areMembersLimited: boolean = $state(false);

    $effect(() => {
        const limit = getServiceLimit('members', null, page.data.currentPlan) || Infinity;
        const isLimited = limit !== 0 && limit < Infinity;
        areMembersLimited =
            isCloud &&
            (($readOnly && !GRACE_PERIOD_OVERRIDE) || (isLimited && $members?.total >= limit));
    });

    const program: Models.Program | null = $derived(page.data.program as Models.Program);

    const organization = $derived(page.data.organization as Models.Organization);
    const path = $derived.by(() => {
        return resolve('/(console)/organization-[organization]', {
            organization: organization.$id
        });
    });

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
</script>

{#if organization?.$id}
    <Cover>
        <svelte:fragment slot="header">
            <Layout.Stack direction="row" alignItems="center" gap="m" class="u-min-width-0">
                <Typography.Title color="--fgcolor-neutral-primary" size="xl" truncate>
                    {organization.name}
                </Typography.Title>

                {#if isCloud}
                    {#if program && program.tag}
                        <Badge variant="secondary" content={program.tag}>
                            <Icon icon={IconsMap[program.icon]} size="s" slot="start" />
                        </Badge>
                    {:else if organization?.billingPlanDetails.group === BillingPlanGroup.Starter}
                        <Badge variant="secondary" content="Free"></Badge>
                    {/if}

                    {#if organization?.billingTrialStartDate && $daysLeftInTrial > 0 && organization.billingPlanDetails.trial && organization?.billingTrialDays}
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

                <Button
                    secondary
                    icon
                    size="xs"
                    on:click={() =>
                        isCloud ? goto(`${base}/create-organization`) : newOrgModal.set(true)}>
                    <Icon icon={IconPlusSm} size="m" />
                </Button>
            </Layout.Stack>
            <div class="u-margin-inline-start-auto">
                <Layout.Stack direction="row" alignItems="center" gap="xl">
                    {#if $members.total > 1}
                        <a href={`${path}/members`} class="is-not-mobile">
                            <AvatarGroup size="xs" {avatars} total={$members?.total ?? 0} />
                        </a>
                    {/if}

                    {#if $isOwner}
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
                                <!-- TODO: @itznotabug - should be updated since members are unlimited on paid plans now -->
                                {!organization?.billingPlanDetails.addons.seats.supported
                                    ? 'Upgrade to add more members'
                                    : `You've reached the members limit for the ${
                                          organization?.billingPlanDetails?.name
                                      } plan`}
                            </div>
                        </Tooltip>
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
