<script lang="ts">
    import { Alert, Modal, PaginationWithLimit } from '$lib/components';
    import { Container } from '$lib/layout';
    import ContainerHeader from './containerHeader.svelte';
    import BackupPolicy from './policy.svelte';
    import UpgradeCard from './upgradeCard.svelte';
    import Table from './table.svelte';
    import type { PageData } from './$types';
    import CreatePolicy from './createPolicy.svelte';
    import { Button } from '$lib/elements/forms';
    import { addNotification, dismissAllNotifications } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import LockedBackupsDarkDesktop from '$lib/images/backups/backups-locked-dark.svg';
    import LockedBackupsLightDesktop from '$lib/images/backups/backups-locked-light.svg';
    import LockedBackupsDarkMobile from '$lib/images/backups/backups-locked-mobile-dark.svg';
    import LockedBackupsLightMobile from '$lib/images/backups/backups-locked-mobile-light.svg';
    import { app } from '$lib/stores/app';
    import { onMount } from 'svelte';
    import { feedback } from '$lib/stores/feedback';
    import { cronExpression, type UserBackupPolicy } from '$lib/helpers/backups';

    let showCreatePolicy = false;
    let policyCreateError: string;
    let showCreateManualBackup = false;
    let totalPolicies: UserBackupPolicy[] = [];
    let isDisabled = isSelfHosted || (isCloud && $organization?.billingPlan === BillingPlan.FREE);

    export let data: PageData;

    const showFeedbackNotification = () => {
        let showOnCounts = [2, 4, 8, 10];
        let counter = localStorage.getItem('createBackupsCounter');

        if (counter) {
            const parsedCounter = parseInt(counter);
            if (showOnCounts.includes(parsedCounter)) {
                addNotification({
                    type: 'info',
                    icon: 'question-mark-circle',
                    message:
                        'How was your experience with our new Backups feature? Give us your feedback and help us improve!',
                    timeout: 15000,
                    buttons: [
                        {
                            name: 'Leave Feedback',
                            method: () => {
                                feedback.toggleFeedback();
                                dismissAllNotifications();
                            }
                        },
                        {
                            name: 'Ask me later',
                            method: () => dismissAllNotifications()
                        }
                    ]
                });
            } else {
                localStorage.setItem('createBackupsCounter', (parsedCounter + 1).toString());
            }
        } else {
            localStorage.setItem('createBackupsCounter', '1');
        }
    };

    const createManualBackup = async () => {
        try {
            await sdk.forProject.backups.createArchive(['databases'], data.database.$id);
            addNotification({
                type: 'success',
                message: 'Database backup initiated'
            });
            invalidate(Dependencies.BACKUPS);
            showFeedbackNotification();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showCreateManualBackup = false;
        }
    };

    const createPolicies = async () => {
        const totalPoliciesPromise = totalPolicies.map((policy) => {
            cronExpression(policy);

            return sdk.forProject.backups.createPolicy(
                policy.id,
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

            addNotification({
                isHtml: true,
                type: 'success',
                message
            });

            invalidate(Dependencies.BACKUPS);
        } catch (err) {
            addNotification({
                type: 'error',
                message: err.message
            });
        } finally {
            totalPolicies = [];
            showCreatePolicy = false;
        }
    };

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('archives.*') || response.events.includes('policies.*')) {
                invalidate(Dependencies.BACKUPS);
            }
        });
    });
</script>

<Container size="xxl">
    <div class="u-flex u-gap-32 u-flex-vertical-mobile">
        {#if !isDisabled}
            <div class="u-flex-vertical">
                <ContainerHeader
                    title="Policies"
                    buttonText="Create policy"
                    buttonEvent="create_backup"
                    buttonType="secondary"
                    buttonDisabled={isDisabled}
                    buttonMethod={() => (showCreatePolicy = true)} />

                <BackupPolicy
                    bind:showCreatePolicy
                    policies={data.policies}
                    lastBackupDates={data.lastBackupDates} />
            </div>

            <div class="u-flex-vertical u-width-full-line">
                <ContainerHeader
                    title="Backups"
                    buttonText="Manual Backup"
                    buttonEvent="create_backup"
                    buttonType="secondary"
                    buttonDisabled={isDisabled}
                    buttonMethod={() => (showCreateManualBackup = true)} />

                {#if data.backups.total}
                    <div class="u-padding-block-start-8">
                        <Table {data} />

                        {#if data.backups.total > 6}
                            <PaginationWithLimit
                                name="Backups"
                                limit={data.limit}
                                offset={data.offset}
                                total={data.backups.total} />
                        {/if}
                    </div>
                {:else}
                    <div class="u-flex u-flex-vertical u-gap-16">
                        <article
                            class="empty card u-width-full-line common-section u-margin-block-start-24">
                            No backups yet
                        </article>
                    </div>
                {/if}
            </div>
        {:else}
            <div class="u-flex-vertical u-gap-32">
                <UpgradeCard />

                <img
                    class="is-not-mobile"
                    src={$app.themeInUse === 'dark'
                        ? LockedBackupsDarkDesktop
                        : LockedBackupsLightDesktop}
                    alt="create"
                    aria-hidden="true"
                    style="opacity: 0.5" />

                <img
                    class="is-only-mobile"
                    src={$app.themeInUse === 'dark'
                        ? LockedBackupsDarkMobile
                        : LockedBackupsLightMobile}
                    alt="create"
                    aria-hidden="true"
                    style="opacity: 0.5" />
            </div>
        {/if}
    </div>
</Container>

<Modal
    title="Create backup policy"
    size="big"
    onSubmit={createPolicies}
    bind:show={showCreatePolicy}
    bind:error={policyCreateError}>
    <CreatePolicy bind:totalPolicies isShowing={showCreatePolicy} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreatePolicy = false)}>Cancel</Button>
        <Button submit disabled={!totalPolicies.length}>Create</Button>
    </svelte:fragment>
</Modal>

<Modal
    title="Create manual backup"
    bind:show={showCreateManualBackup}
    onSubmit={createManualBackup}>
    <p class="text" data-private>
        Manual backups are <b>retained forever</b> unless manually deleted. Use them when making significant
        changes to your data structure or as a safeguard for future rollbacks.
    </p>
    <Alert type="info">
        <svelte:fragment slot="title">
            Depending on the size of your data, this may take a while.
        </svelte:fragment>
    </Alert>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCreateManualBackup = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>

<style>
    .empty {
        block-size: 365px;
        text-align: center;
        align-content: center;
    }
</style>
