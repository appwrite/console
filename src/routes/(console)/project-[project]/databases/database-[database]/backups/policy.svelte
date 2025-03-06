<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { DropList, DropListItem, Modal } from '$lib/components';
    import { Button, FormList, InputCheckbox } from '$lib/elements/forms/index';

    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { parseExpression } from 'cron-parser';
    import { toLocaleDateTime } from '$lib/helpers/date';

    import EmptyDark from '$lib/images/backups/backups-dark.png';
    import EmptyLight from '$lib/images/backups/backups-light.png';
    import type { BackupPolicy, BackupPolicyList } from '$lib/sdk/backups';
    import { backupFrequencies } from '$lib/helpers/backups';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let showDropdown = [];
    let showDelete = false;
    let selectedPolicy: BackupPolicy = null;

    let showEveryPolicy = false;
    let confirmedDeletion = false;

    export let showCreatePolicy = false;
    export let policies: BackupPolicyList;
    export let lastBackupDates: Record<string, string>;

    async function deletePolicy() {
        try {
            await sdk.forProject.backups.deletePolicy(selectedPolicy.$id);
            addNotification({
                type: 'success',
                message: 'Backup policy has been deleted'
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
            confirmedDeletion = false;
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

        const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts;

        if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
            return 'Runs monthly';
        }

        if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
            const days = dayOfWeek
                .split(',')
                .map((day) => backupFrequencies.weekly[parseInt(day, 10)].label);

            const dayString =
                days.length > 1 ? days.slice(0, -1).join(', ') + ' and ' + days.slice(-1) : days[0];

            return `Runs weekly on ${dayString}`;
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

    const getTruncatedPolicyDescription = (policyDescription: string): string => {
        let firstDayIndex = -1;
        let secondDayIndex = -1;

        for (const day of backupFrequencies.weekly.map((item) => item.label)) {
            const dayIndex = policyDescription.indexOf(day);
            if (dayIndex !== -1) {
                if (firstDayIndex === -1) {
                    firstDayIndex = dayIndex;
                } else {
                    secondDayIndex = dayIndex;
                    break;
                }
            }
        }

        if (firstDayIndex === -1 || secondDayIndex === -1) {
            return policyDescription;
        }

        return `${policyDescription.substring(0, secondDayIndex).trim().replace(',', '')}...`;
    };
</script>

<div class="u-flex u-flex-vertical u-gap-16">
    <Card
        class="backups-policy-list-card u-margin-block-start-24"
        style="padding: 0; min-width: 21.5rem;">
        <div class="inner-card u-flex-vertical-mobile">
            {#each policies.policies as policy, index (policy.$id)}
                {@const policyDescription = getPolicyDescription(policy.schedule)}
                {@const policyDescriptionShort = getTruncatedPolicyDescription(policyDescription)}
                {@const shouldUseTooltip = policyDescription.length > policyDescriptionShort.length}

                <div
                    class="policy-card-item-padding u-flex-vertical u-gap-10"
                    data-show-every={showEveryPolicy}
                    data-visible={index < 3 || showEveryPolicy}
                    class:opacity-gradient-bottom={index === 2}
                    class:u-padding-block-start-10={index !== 0}
                    class:u-padding-block-end-10={index === 0 && policies.policies.length > 1}>
                    <div class="u-flex-vertical u-gap-2">
                        <div class="u-flex u-main-space-between">
                            <h3 class="body-text-2 u-bold darker-neutral-color">{policy.name}</h3>
                            <DropList
                                noArrow
                                bind:show={showDropdown[index]}
                                placement="bottom-end">
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
                                            trackEvent(Click.PolicyDeleteClick);
                                        }}>
                                        Delete
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </div>

                        <div
                            class="policy-item-subtitles u-flex u-gap-6"
                            style="width: fit-content;">
                            {#if shouldUseTooltip}
                                <Tooltip>
                                    <span>
                                        {policyDescriptionShort}
                                    </span>
                                    <span slot="tooltip">{policyDescription}</span>
                                </Tooltip>
                            {:else}
                                {policyDescription}
                            {/if}

                            <span class="small-ellipse">●</span>

                            {formatRetentionMessage(policy.retention)}
                        </div>
                    </div>

                    <div
                        class="policy-cycles u-flex u-main-space-between u-padding-block-2 policy-item-subtitles">
                        <div style="width: 128px" class="u-flex-vertical policy-item-caption">
                            <span style="color: #97979B">Previous</span>
                            <div
                                class="u-flex u-gap-4 u-cross-center policy-item-subtitles darker-neutral-color">
                                <span
                                    class="medium-ellipse"
                                    class:success={!!lastBackupDates[policy.$id]}>●</span>
                                <span class="policy-item-subtitles">
                                    {#if lastBackupDates[policy.$id]}
                                        {toLocaleDateTime(lastBackupDates[policy.$id])}
                                    {:else}
                                        No backups yet
                                    {/if}
                                </span>
                            </div>
                        </div>

                        <div class="u-border-vertical" />

                        <div style="width: 128px" class="u-flex-vertical policy-item-caption">
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
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmptyDark}
                            alt="create"
                            aria-hidden="true"
                            height="152"
                            width="280" />
                    {:else}
                        <img
                            src={EmptyLight}
                            alt="create"
                            aria-hidden="true"
                            height="152"
                            width="280" />
                    {/if}

                    <div class="u-text-center">
                        <div class="body-text-2 u-bold darker-neutral-color">
                            Ensure your data stays safe
                        </div>
                        <p class="body-text-2 u-padding-block-start-4 policy-item-caption">
                            Create a backup policy to automate regular and secure data protection.
                        </p>
                    </div>

                    <div class="u-flex u-main-center u-padding-block-end-8">
                        <Button
                            event="create_policy"
                            class="small-radius-border-button"
                            on:click={() => (showCreatePolicy = true)}>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create policy
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
</div>

<Modal title="Delete policy" bind:show={showDelete} onSubmit={deletePolicy}>
    <FormList>
        <div class="u-flex-vertical u-gap-16">
            <p class="text" data-private>
                Are you sure you want to delete the <b>{selectedPolicy.name}</b> policy?
            </p>

            <p class="text" data-private>
                <b
                    >This will also delete all backups associated with this policy. This action is
                    irreversible.</b>
            </p>

            <div class="input-check-box-friction">
                <InputCheckbox
                    required
                    id="delete_policy"
                    bind:checked={confirmedDeletion}
                    label="I understand and confirm" />
            </div>
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={!confirmedDeletion}>Delete</Button>
    </svelte:fragment>
</Modal>

<style>
    .inner-card {
        margin: 0 -1px;
        padding: 0.5rem;
    }

    .u-border-vertical {
        width: 1px;
        height: 34px;
        background-color: hsl(var(--border));
    }

    :global(.small-ellipse) {
        font-size: 0.25rem;
    }

    :global(.medium-ellipse) {
        font-size: 0.5rem;
        color: hsl(var(--color-neutral-20));
    }

    :global(.medium-ellipse.success) {
        color: hsl(var(--color-success-100));
    }

    :global(.u-gap-6) {
        gap: 0.375rem;
    }

    .u-gap-10 {
        gap: 0.625rem;
    }

    .policy-card-item-padding {
        padding: var(--space-3, 6px) var(--space-4, 8px);
        border-block-end: solid 0.0625rem hsl(var(--border));
    }

    .policy-card-item-padding:last-child {
        border-block-end: none;
    }

    .u-padding-block-start-10 {
        padding-block-start: 10px;
    }

    .u-padding-block-end-10 {
        padding-block-end: 10px;
    }

    .policy-item-subtitles {
        font-size: 12px;
        font-weight: 400;
        line-height: 150%;
        font-style: normal;
        font-family: Inter;
    }

    :global(.input-check-box-friction .choice-item-title) {
        margin-block-start: 1px;
    }

    :global(.theme-light .policy-item-subtitles) {
        color: var(--fgcolor-neutral-secondary, #56565c);
    }

    :global(.theme-light .policy-item-caption) {
        color: var(--color-neutral-50, #818186);
    }

    :global(.theme-light .darker-neutral-color) {
        color: var(--color-neutral-80, #414146);
    }

    :global(.show-more-policy-button) {
        border-radius: 1rem;
        background: transparent;
    }

    .show-more-policy-wrapper {
        padding-inline: 13px;
        padding-block-end: 0.875rem;
    }

    @media (max-width: 768px) {
        :global(.backups-policy-list-card) {
            min-width: unset !important;
        }

        .policy-card-item-padding {
            display: none;
            visibility: hidden;
        }

        .policy-card-item-padding[data-visible='true'] {
            display: block;
            visibility: visible;
        }

        .policy-card-item-padding[data-visible='true']:nth-child(3) {
            opacity: 0.25;
            border-block-end: none;
        }

        .policy-card-item-padding[data-visible='true']:nth-child(3) .policy-cycles {
            height: 0;
            margin: unset;
            padding: unset;
            visibility: hidden;
        }

        .policy-card-item-padding[data-visible='false']:nth-child(n + 4) {
            opacity: 0;
            height: 0;
            padding: unset;
            border-block-end: none;
        }

        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3):not(
                :last-child
            ) {
            border-block-end: solid 0.0625rem hsl(var(--border));
        }

        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3)
            .policy-cycles,
        .policy-card-item-padding[data-visible='true'][data-show-every='true']:nth-child(3),
        .policy-cycles {
            opacity: 1;
            height: auto;
            visibility: visible;
        }

        .opacity-gradient-bottom {
            overflow: hidden;
            position: relative;
        }

        .opacity-gradient-bottom[data-visible='true']::after {
            content: ''; /* blocks the dropdown click */
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
            content: revert;
            background: transparent;
        }
    }
</style>
