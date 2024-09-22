<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { DropList, DropListItem, Modal } from '$lib/components';
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

    let showEveryPolicy = false;

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

    const getPolicyDescription = (cron: string): string => {
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
    };
</script>

<div class="u-flex u-flex-vertical u-gap-16">
    <Card
        class="u-margin-block-start-24"
        style="--card-padding: 0.5rem; --card-padding-mobile: 0.5rem; min-width: 21.5rem;">
        <div class="u-flex-vertical-mobile">
            {#each policies.policies as policy, index (policy.$id)}
                <div
                    class="policy-card-item-padding u-flex-vertical u-gap-10"
                    class:u-padding-block-end-10={index === 0}
                    class:u-padding-block-start-10={index !== 0}
                    class:opacity-gradient-bottom={index === 2}
                    data-show-every={showEveryPolicy}
                    data-visible={index <= 3 || showEveryPolicy}>
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

                    <div
                        class="policy-cycles u-flex u-gap-12 u-cross-start u-padding-block-2 policy-item-subtitles">
                        <div class="u-flex-vertical policy-item-caption">
                            <span style="color: #97979B">Previous</span>
                            <div
                                class="u-flex u-gap-4 u-cross-center policy-item-subtitles darker-neutral-color">
                                <span
                                    style="font-size: 1rem; margin-bottom: 2px; color: {lastBackupDates[
                                        policy.$id
                                    ]
                                        ? 'hsl(var(--color-success-100))'
                                        : 'inherit'};">●</span>
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
                                    parseExpression(policy.schedule, {
                                        utc: true
                                    })
                                        .next()
                                        .toString()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="u-padding-24 u-flex-vertical u-gap-16 u-cross-center">
                    <div>
                        {#if $app.themeInUse === 'dark'}
                            <img src={EmptyDark} alt="create" aria-hidden="true" height="152" />
                        {:else}
                            <img src={EmptyLight} alt="create" aria-hidden="true" height="152" />
                        {/if}
                    </div>

                    <div class="u-text-center">
                        <div class="body-text-2 u-bold darker-neutral-color">
                            Ensure your data stays safe
                        </div>
                        <p class="body-text-2 u-padding-block-start-4 policy-item-caption">
                            Create a backup policy to automate regular and secure data protection.
                        </p>
                    </div>

                    <div class="u-flex u-main-center">
                        <Button
                            event="create_policy"
                            class="small-radius-border-button"
                            on:click={() => (showCreatePolicy = true)}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text">Create Policy</span>
                        </Button>
                    </div>
                </div>
            {/each}
        </div>

        {#if !showEveryPolicy && policies.policies.length >= 3}
            <div class="is-only-mobile show-more-policy-wrapper">
                <Button
                    secondary
                    fullWidthMobile
                    class="show-more-policy-button"
                    on:click={() => (showEveryPolicy = !showEveryPolicy)}>
                    Show more
                </Button>
            </div>
        {/if}
    </Card>

    {#if policies.total > 0}
        <span class="policy-item-subtitles policy-addon-fee-alert">
            Database backups are free until <b>November 2024</b>. Starting then, a $20.00 fee will
            apply per backup policy.
        </span>
    {/if}
</div>

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
        padding: var(--space-3, 6px) var(--space-4, 8px);
        border-block-end: solid 0.0625rem hsl(var(--color-border));
    }

    .policy-card-item-padding:last-child {
        border-block-end: none !important;
    }

    .policy-addon-fee-alert {
        margin-inline: 0.5rem;
    }

    :global(.theme-light .policy-addon-fee-alert) {
        color: var(--mid-neutrals-60, #6c6c71);
    }

    .u-padding-block-start-10 {
        padding-block-start: 10px !important;
    }

    .u-padding-block-end-10 {
        padding-block-end: 10px !important;
    }

    .policy-item-subtitles {
        font-size: 12px;
        font-weight: 400;
        line-height: 150%;
        font-style: normal;
        font-family: Inter;
    }

    .policy-cycles {
        margin-block-start: 0.625rem !important;
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

    :global(.show-more-policy-button) {
        background: transparent;
        border-radius: 1rem !important;
    }

    .show-more-policy-wrapper {
        padding-inline: 13px;
        padding-block-end: 4px;
    }

    @media (max-width: 768px) {
        .policy-cycles.u-cross-start {
            justify-content: space-between !important;
        }

        .policy-card-item-padding {
            display: none !important;
            visibility: hidden !important;
        }

        .policy-card-item-padding[data-visible='true'] {
            display: block !important;
            visibility: visible !important;
        }

        .policy-card-item-padding[data-visible='true']:nth-child(3) {
            opacity: 0.25;
            border-block-end: none !important;
        }

        .policy-card-item-padding[data-visible='true']:nth-child(3) .policy-cycles {
            height: 0 !important;
            margin: unset !important;
            padding: unset !important;
            visibility: hidden !important;
        }

        .policy-card-item-padding[data-visible='false']:nth-child(n + 4) {
            height: 0 !important;
            padding: unset !important;
            border-block-end: none !important;
        }

        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3) {
            opacity: 1;
        }

        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3):not(
                :last-child
            ) {
            border-block-end: solid 0.0625rem hsl(var(--color-border)) !important;
        }

        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3)
            .policy-cycles,
        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3),
        .policy-cycles {
            height: auto !important;
            visibility: visible !important;
        }

        .opacity-gradient-bottom {
            overflow: hidden;
            position: relative;
        }

        .opacity-gradient-bottom[data-visible='true']::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 100%;
            background: linear-gradient(to top, rgba(255, 255, 255, 1), transparent);
        }

        :global(.theme-dark) .opacity-gradient-bottom[data-visible='true']::after {
            background: linear-gradient(to top, rgba(28, 28, 33, 1), transparent);
        }

        .opacity-gradient-bottom[data-visible='true'][data-show-every='true']::after,
        :global(.theme-dark)
            .opacity-gradient-bottom[data-visible='true'][data-show-every='true']::after {
            background: transparent !important;
        }
    }
</style>
