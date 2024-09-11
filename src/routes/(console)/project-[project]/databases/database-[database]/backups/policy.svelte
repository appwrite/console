<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { DropList, DropListItem, Empty, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms/index';
    import { type Models } from '@appwrite.io/console';

    import { app } from '$lib/stores/app';
    import EmptyDark from '$lib/images/backups/backups-empty-dark.svg';
    import EmptyLight from '$lib/images/backups/backups-empty-light.svg';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { parseExpression } from 'cron-parser';
    import { toLocaleDateTime } from '$lib/helpers/date';

    let showDropdown = [];
    let showDelete = false;
    let selectedPolicy: Models.BackupPolicy = null;

    export let showCreatePolicy = false;
    export let policies: Models.BackupPolicyList;
    export let lastBackupDates: Record<string, string>;

    async function deletePolicy() {
        try {
            await sdk.forProject.backups.deletePolicy(selectedPolicy.$id);
            addNotification({
                type: 'success',
                message: 'Backup policy deleted'
            });

            invalidate(Dependencies.BACKUPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showDelete = false;
            selectedPolicy = null;
        }
    }

    const formatRetentionMessage = (retention: number): string => {
        const foreverValue = 36500; // 365 * 100

        if (retention === foreverValue) return 'Retained forever';
        if (retention % 365 === 0)
            return `Retained for ${retention / 365} year${retention > 365 ? 's' : ''}`;
        if (retention % 30 === 0)
            return `Retained for ${retention / 30} month${retention > 30 ? 's' : ''}`;
        if (retention % 7 === 0)
            return `Retained for ${retention / 7} week${retention > 7 ? 's' : ''}`;
        return `Retained for ${retention} day${retention > 1 ? 's' : ''}`;
    };

    function getPolicyDescription(cron: string): string {
        const cronParts = cron.split(' ');

        // A standard cron has 5 parts: minute, hour, day of month, month, day of week
        const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts;

        if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
            return 'Runs monthly';
        }

        if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
            return `Runs weekly on Monday`;
        }

        if (
            dayOfMonth === '*' &&
            month === '*' &&
            dayOfWeek === '*' &&
            hour === '*' &&
            minute !== '*'
        ) {
            return 'Runs hourly';
        }

        if (
            dayOfMonth === '*' &&
            month === '*' &&
            dayOfWeek === '*' &&
            hour !== '*' &&
            minute !== '*'
        ) {
            return 'Runs daily';
        }
    }
</script>

<Card
    class="u-margin-block-start-24"
    style="--card-padding: 1rem; --card-padding-mobile: 2rem; min-width: 21rem;">
    <div class="u-flex-vertical-mobile">
        {#each policies.policies as policy, index}
            <!-- TODO: check card paddings later -->
            <div
                class="policy-card-item-padding u-flex-vertical u-gap-10"
                class:u-padding-block-start-10={index !== 0}
                class:u-sep-block-end={index !== policies.total - 1}
                style:margin-block={index !== 0 ? '6px' : ''}>
                <div class="u-flex-vertical u-gap-2">
                    <div class="u-flex u-main-space-between">
                        <h3 class="body-text-2 u-bold darker-neutral-color">{policy.name}</h3>
                        <DropList bind:show={showDropdown[index]} placement="bottom-end">
                            <button
                                class="is-only-icon is-text"
                                aria-label="More options"
                                on:click|preventDefault={() => {
                                    showDropdown[index] = !showDropdown[index];
                                }}>
                                <span class="icon-dots-horizontal" aria-hidden="true" />
                            </button>

                            <svelte:fragment slot="list">
                                <DropListItem
                                    on:click={() => {
                                        showDelete = true;
                                        selectedPolicy = policy;
                                        showDropdown[index] = false;
                                    }}>
                                    Delete
                                </DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </div>

                    <div class="policy-item-subtitles u-flex u-gap-6">
                        {getPolicyDescription(policy.schedule)}
                        <span class="small-ellipse">●</span>
                        {formatRetentionMessage(policy.retention)}
                    </div>
                </div>

                <!-- Previous and Next section -->
                <div
                    class="policy-cycles u-flex u-cross-start u-padding-block-2 policy-item-subtitles">
                    <div class="u-flex-vertical policy-item-caption">
                        <span style="color: #97979B">Previous</span>

                        <div
                            class="u-flex u-gap-4 u-cross-center policy-item-subtitles darker-neutral-color">
                            <span
                                style="font-size: 1rem; margin-bottom: 2px; color: {lastBackupDates[
                                    policy.$id
                                ]
                                    ? 'hsl(var(--color-success-100))'
                                    : 'inherit'};">
                                ●
                            </span>

                            {#if lastBackupDates[policy.$id]}
                                {toLocaleDateTime(lastBackupDates[policy.$id])}
                            {:else}
                                No backups yet
                            {/if}
                        </div>
                    </div>

                    <div class="u-border-vertical" />

                    <div class="u-flex-vertical policy-item-caption">
                        <span style="color: #97979B">Next</span>
                        <div
                            class="u-flex u-gap-4 u-cross-center policy-item-subtitles darker-neutral-color">
                            {toLocaleDateTime(
                                parseExpression(policy.schedule, { utc: false }).next().toString()
                            )}
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <Empty single isCard={false} target="backup" on:click={() => (showCreatePolicy = true)}>
                <div slot="empty-media">
                    {#if $app.themeInUse === 'dark'}
                        <img src={EmptyDark} alt="create" aria-hidden="true" height="242" />
                    {:else}
                        <img src={EmptyLight} alt="create" aria-hidden="true" height="242" />
                    {/if}
                </div>

                <div class="u-text-center">
                    <div class="body-text-2 u-bold darker-neutral-color">
                        Ensure your data stays safe
                    </div>
                    <p class="body-text-2 u-margin-block-start-4 policy-item-caption">
                        Create a backup policy to automate regular and secure data protection.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button
                        event="create_policy"
                        class="small-radius-border-button"
                        on:click={() => (showCreatePolicy = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create Policy</span>
                    </Button>
                </div>
            </Empty>
        {/each}
    </div>
</Card>

<Modal
    title="Delete policy"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    headerDivider={false}
    onSubmit={deletePolicy}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedPolicy.name}</b> policy?
        <br />This action is irreversible.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>

<style>
    .u-border-vertical {
        width: 1px;
        height: 34px;
        margin: 0 1.5rem;
        background-color: hsl(var(--color-border));
    }

    :global(.small-ellipse) {
        font-size: 0.5rem !important;
    }

    :global(.u-gap-6) {
        gap: 0.375rem !important;
    }

    .u-gap-10 {
        gap: 0.625rem !important;
    }

    .policy-card-item-padding {
        /*padding-inline: var(--space-3, 6px) var(--space-4, 8px);*/
    }

    .u-padding-block-start-10 {
        padding-block-start: 10px !important;
    }

    .policy-item-subtitles {
        font-size: 12px;
        font-weight: 400;
        line-height: 150%;
        font-style: normal;
        font-family: Inter;
    }

    .policy-cycles {
        margin-block: 0.625rem !important;
    }

    :global(.theme-light .policy-item-subtitles) {
        color: var(--color-fgColor-neutral-secondary, #56565c);
    }

    :global(.theme-light .policy-item-caption) {
        color: var(--color-neutral-50, #818186);
    }

    :global(.theme-light .darker-neutral-color) {
        color: var(--color-neutral-80, #414146);
    }
</style>
