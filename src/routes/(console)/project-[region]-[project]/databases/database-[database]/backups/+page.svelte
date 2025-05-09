<script lang="ts">
    import { Modal, PaginationWithLimit } from '$lib/components';
    import { Container } from '$lib/layout';
    import ContainerHeader from './containerHeader.svelte';
    import BackupPolicy from './policy.svelte';
    import LockedCard from './locked.svelte';
    import Table from './table.svelte';
    import type { PageData } from './$types';
    import CreatePolicy from './createPolicy.svelte';
    import { Button } from '$lib/elements/forms';
    import { addNotification, dismissAllNotifications } from '$lib/stores/notifications';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { currentPlan } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import { feedback } from '$lib/stores/feedback';
    import { cronExpression, type UserBackupPolicy } from '$lib/helpers/backups';
    import { ID } from '@appwrite.io/console';
    import { showCreateBackup, showCreatePolicy } from './store';
    import { getProjectId } from '$lib/helpers/project';
    import { trackEvent } from '$lib/actions/analytics';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    let policyCreateError: string;
    let totalPolicies: UserBackupPolicy[] = [];
    let isDisabled = isSelfHosted || (isCloud && !$currentPlan.backupsEnabled);

    export let data: PageData;

    const showFeedbackNotification = () => {
        let counter = localStorage.getItem('createBackupsCounter');
        const parsedCounter = counter ? parseInt(counter, 10) : 0;

        // Exponential growth: Show after 1, 2, 4, 8, 16 uses
        const showOnCount = Math.pow(2, Math.floor(Math.log2(parsedCounter)) || 0);

        if (parsedCounter === showOnCount || !counter) {
            addNotification({
                type: 'info',
                icon: 'question-mark-circle',
                message:
                    'How was your experience with our new Backups feature? Give us your feedback and help us improve!',
                timeout: 15000,
                buttons: [
                    {
                        name: 'Leave feedback',
                        method: () => {
                            dismissAllNotifications();
                            feedback.toggleFeedback('backups');
                        }
                    },
                    {
                        name: 'Ask me later',
                        method: () => dismissAllNotifications()
                    }
                ]
            });
        }

        localStorage.setItem('createBackupsCounter', ((parsedCounter ?? 0) + 1).toString());
    };

    const createManualBackup = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .backups.createArchive(['databases'], data.database.$id);
            addNotification({
                type: 'success',
                message: 'Database backup has started'
            });
            invalidate(Dependencies.BACKUPS);
            trackEvent('click_manual_submit');
            showFeedbackNotification();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            $showCreateBackup = false;
        }
    };

    const trackEvents = (policies) => {
        policies.forEach((policy) => {
            let actualDay = null;
            const monthlyBackupFrequency = policy.monthlyBackupFrequency;
            switch (monthlyBackupFrequency) {
                case 'first':
                    actualDay = '1st';
                    break;
                case 'middle':
                    actualDay = '15th';
                    break;
                case 'end':
                default:
                    actualDay = '28th';
                    break;
            }

            const message = {
                keepFor: `${policy.retained} days`,
                frequency: policy.plainTextFrequency,
                policy: policy.default ? 'preset' : 'custom'
            };

            if (actualDay) message['monthlyInterval'] = actualDay;

            trackEvent('submit_policy_submit', message);
        });
    };

    const createPolicies = async () => {
        const totalPoliciesPromise = totalPolicies.map((policy) => {
            cronExpression(policy);

            return sdk
                .forProject(page.params.region, page.params.project)
                .backups.createPolicy(
                    ID.unique(),
                    ['databases'],
                    policy.retained,
                    policy.schedule,
                    policy.label,
                    data.database.$id
                );
        });

        try {
            await Promise.all(totalPoliciesPromise);

            const message =
                totalPolicies.length > 1
                    ? `Backup policies have been created`
                    : `<b>${totalPolicies[0].label}</b> policy has been created`;

            // TODO: html isn't yet supported on Toast.
            addNotification({
                isHtml: true,
                type: 'success',
                message
            });

            trackEvents(totalPolicies);

            invalidate(Dependencies.BACKUPS);
            showFeedbackNotification();
        } catch (err) {
            addNotification({
                type: 'error',
                message: err.message
            });
        } finally {
            totalPolicies = [];
            $showCreatePolicy = false;
        }
    };

    onMount(() => {
        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe(['project', 'console'], (response) => {
                // fast path return.
                if (!response.channels.includes(`projects.${getProjectId()}`)) return;

                if (
                    response.events.includes('archives.*') ||
                    response.events.includes('policies.*')
                ) {
                    invalidate(Dependencies.BACKUPS);
                }
            });
    });
</script>

<Container size="xxl">
    <div class="u-flex u-gap-32 u-flex-vertical-mobile">
        {#if !isDisabled}
            <div class="u-flex-vertical u-gap-16 policies-holder-card">
                <ContainerHeader
                    title="Policies"
                    buttonText="Create policy"
                    buttonEvent="create_backup"
                    buttonType="secondary"
                    buttonDisabled={isDisabled}
                    policiesCreated={data.policies.total}
                    maxPolicies={$currentPlan.backupPolicies}
                    buttonMethod={() => {
                        $showCreatePolicy = true;
                        trackEvent('click_policy_create');
                    }} />

                <BackupPolicy
                    bind:showCreatePolicy={$showCreatePolicy}
                    policies={data.policies}
                    lastBackupDates={data.lastBackupDates} />
            </div>

            <div class="u-flex-vertical u-gap-16 u-width-full-line u-overflow-x-auto">
                <ContainerHeader
                    title="Backups"
                    buttonText="Manual backup"
                    buttonEvent="create_backup"
                    buttonType="secondary"
                    buttonDisabled={isDisabled}
                    buttonMethod={() => {
                        $showCreateBackup = true;
                        trackEvent('click_manual_create');
                    }} />

                {#if data.backups.total}
                    <Layout.Stack gap="xxl">
                        <Table {data} />

                        {#if data.backups.total > 6}
                            <PaginationWithLimit
                                name="Backups"
                                limit={data.limit}
                                offset={data.offset}
                                total={data.backups.total} />
                        {/if}
                    </Layout.Stack>
                {:else}
                    <div class="u-flex u-flex-vertical u-gap-16">
                        <article class="empty card u-width-full-line common-section">
                            No backups yet
                        </article>
                    </div>
                {/if}
            </div>
        {:else}
            <div class="u-flex-vertical u-gap-32">
                <LockedCard />
            </div>
        {/if}
    </div>
</Container>

<Modal
    title="Create backup policy"
    onSubmit={createPolicies}
    bind:show={$showCreatePolicy}
    bind:error={policyCreateError}>
    <CreatePolicy bind:totalPolicies isShowing={$showCreatePolicy} isFromBackupsTab />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => ($showCreatePolicy = false)}>Cancel</Button>
        <Button submit disabled={!totalPolicies.length}>Create</Button>
    </svelte:fragment>
</Modal>

<Modal
    size="s"
    title="Create manual backup"
    bind:show={$showCreateBackup}
    onSubmit={createManualBackup}>
    <Typography.Text variant="m-400">
        Manual backups are <b>retained forever</b> unless manually deleted. Use for major data changes
        or rollback safeguards.
    </Typography.Text>

    <Typography.Text variant="m-500">
        <b>Depending on the size of your data, this may take a while.</b>
    </Typography.Text>

    <svelte:fragment slot="footer">
        <Button text on:click={() => ($showCreateBackup = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>

<style>
    .empty {
        block-size: 365px;
        text-align: center;
        align-content: center;
    }

    @media (min-width: 768px) {
        .policies-holder-card {
            min-width: 330px;
        }
    }
</style>
