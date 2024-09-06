<script lang="ts">
    import { Alert, Empty, Modal, PaginationWithLimit } from '$lib/components';
    import { Container } from '$lib/layout';
    import ContainerHeader from './containerHeader.svelte';
    import BackupPolicy from './policy.svelte';
    import UpgradeCard from './upgradeCard.svelte';
    import Table from './table.svelte';
    import type { PageData } from './$types';
    import CreatePolicy from './createPolicy.svelte';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
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

    let showCreatePolicy = false;
    let showCreateManualBackup = false;
    let isDisabled = isSelfHosted || (isCloud && $organization?.billingPlan === BillingPlan.FREE);

    export let data: PageData;

    const createManualBackup = async () => {
        try {
            await sdk.forProject.backups.createArchive(['databases'], data.database.$id);
            addNotification({
                type: 'success',
                message: 'Backup successfully created'
            });
            invalidate(Dependencies.BACKUPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showCreateManualBackup = false;
        }
    };
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

                <BackupPolicy policies={data.policies} bind:showCreatePolicy />
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
                    <Empty single on:click={() => (showCreateManualBackup = true)}>
                        <div class="u-text-center">
                            <div class="body-text-2 u-bold darker-neutral-color">
                                Create a backup to get started.
                            </div>
                            <p class="body-text-2 u-margin-block-start-4 policy-item-caption">
                                Need a hand? Learn more in our documentation.
                            </p>
                        </div>

                        <div class="u-flex u-gap-16 u-main-center">
                            <Button
                                text
                                external
                                event="empty_documentation"
                                href="https://appwrite.io/docs/products/databases/backups"
                                ariaLabel="create backup"
                                >Documentation
                            </Button>

                            <Button
                                event="create_policy"
                                class="small-radius-border-button"
                                on:click={() => (showCreateManualBackup = true)}>
                                <span class="icon-plus" aria-hidden="true" />
                                <span class="text">Create Backup</span>
                            </Button>
                        </div>
                    </Empty>
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

<CreatePolicy bind:showCreate={showCreatePolicy} />

<Modal title="Create manual backup" bind:show={showCreateManualBackup} onSubmit={createManualBackup}>
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
