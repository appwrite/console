<script lang="ts">
    import {
        Button,
        Helper,
        InputCheckbox,
        InputSelect,
        InputSelectCheckbox,
        InputSwitch,
        InputText,
        InputTime,
        Label
    } from '$lib/elements/forms';
    import { ID } from '@appwrite.io/console';
    import { capitalize } from '$lib/helpers/string';
    import { backupRetainingOptions, customRetainingOptions } from '../store';
    import { presetPolicies, showCreatePolicy } from './store';
    import {
        backupFrequencies,
        backupPolicyDescription,
        type UserBackupPolicy
    } from '$lib/helpers/backups';
    import { InputNumber } from '$lib/elements/forms/index.js';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import { Card, Icon, Layout, Link, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { IconPencil, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { goto } from '$app/navigation';
    import { upgradeURL } from '$lib/stores/billing';

    export let isShowing: boolean;
    export let isFromBackupsTab: boolean = false;
    export let title: string | undefined = undefined;
    export let subtitle: string | undefined = undefined;

    export let totalPolicies: UserBackupPolicy[] = [];

    let showCustomPolicy = false;
    let customPolicySection: HTMLElement;
    let listOfCustomPolicies: UserBackupPolicy[] = [];
    $: totalPolicies = [
        ...listOfCustomPolicies,
        ...$presetPolicies.filter((policy) => policy.checked)
    ].map((policy) => {
        if (!policy.id) policy.id = ID.unique();
        return policy;
    });

    let policyInEdit = null;
    let policyBeingEdited = null;

    let policyRetention = 30;
    let selectedTime = '00:00';
    let policyNameError: boolean;
    let policyFrequency = 'monthly';
    let monthlyBackupFrequency = 'end';

    $: policyInputError = customRetention.number === 0;
    $: daysSelectionArray = [];
    $: backupPolicyName = `${capitalize(policyFrequency)} backup`;

    $: customRetentionEnabled = policyRetention === -1;
    let customRetention = { ...customRetainingOptions[2], number: null };

    const resetFormVariables = () => {
        policyInEdit = null;
        policyRetention = 30;
        selectedTime = '00:00';
        daysSelectionArray = [];
        policyFrequency = 'monthly';
        monthlyBackupFrequency = 'end';
        customRetentionEnabled = false;
    };

    const handleSavePolicy = () => {
        if (customRetentionEnabled) {
            policyRetention =
                customRetention.number *
                customRetainingOptions.find((option) => option.value === customRetention.value)
                    .value;
        }

        const userBackupPolicy = {
            default: false,
            selectedTime,
            monthlyBackupFrequency,
            label: backupPolicyName,
            retained: policyRetention,
            id: policyInEdit ?? ID.unique(),
            plainTextFrequency: policyFrequency,
            weeklySelectedDays: daysSelectionArray,
            // placeholder description.
            description: `Runs every ${policyFrequency} and is retained for ${policyRetention}`
        };

        userBackupPolicy.description = customPolicyDescription(userBackupPolicy);

        listOfCustomPolicies = [...listOfCustomPolicies, userBackupPolicy];

        resetFormVariables();
        showCustomPolicy = false;
    };

    const markPolicyChecked = (event: CustomEvent, policy: UserBackupPolicy) => {
        const isChecked = event.detail as boolean;
        presetPolicies.update((all) => {
            return all.map((p) => {
                if (p.label === policy.label) {
                    return { ...p, checked: isChecked };
                }
                return p;
            });
        });
    };

    const customPolicyDescription = (policy: UserBackupPolicy) => {
        return backupPolicyDescription(
            policy.plainTextFrequency,
            null,
            policy.retained,
            policy.monthlyBackupFrequency,
            policy.weeklySelectedDays
        );
    };

    const formPolicyDescription = () => {
        return backupPolicyDescription(
            policyFrequency,
            selectedTime,
            null,
            monthlyBackupFrequency,
            daysSelectionArray
        );
    };

    $: if (showCustomPolicy) {
        customPolicySection?.scrollIntoView({ behavior: 'auto' });
    }

    $: if (isShowing) {
        resetFormVariables();
        showCustomPolicy = false;
        listOfCustomPolicies = [];
        presetPolicies.update((all) =>
            all.map((policy) => {
                policy.checked = false;
                return policy;
            })
        );

        // pre-check the hourly if on pro plan
        if ($organization.billingPlan === BillingPlan.PRO && isFromBackupsTab) {
            presetPolicies.update((all) =>
                all.map((policy) => {
                    policy.id = ID.unique();
                    policy.checked = policy.label === 'Daily';
                    return policy;
                })
            );
        }
    }

    $: {
        const selectedOption = customRetainingOptions.find(
            (option) => option.value === customRetention.value
        );
        if (selectedOption) {
            customRetention = { ...selectedOption, number: customRetention.number };
        }
    }

    let frequencyOptions = ['hourly', 'daily', 'weekly', 'monthly'].map((freq) => ({
        value: freq,
        label: freq.charAt(0).toUpperCase() + freq.slice(1)
    }));
</script>

<div class="u-flex-vertical u-gap-16">
    {#if $organization.billingPlan === BillingPlan.SCALE}
        {#if title || subtitle}
            <div class="body-text-2">
                {#if title}
                    <Typography.Text variant="m-600">
                        {title}
                    </Typography.Text>
                {/if}

                {#if subtitle}
                    <Typography.Caption variant="400">
                        {subtitle}
                    </Typography.Caption>
                {/if}
            </div>
        {/if}
    {/if}

    <!-- because we show a set of pre-defined ones -->
    {#if $organization.billingPlan === BillingPlan.PRO}
        {@const dailyPolicy = $presetPolicies[1]}

        {#if isFromBackupsTab}
            <Layout.Stack gap="m">
                <Card.Base padding="s" radius="s">
                    <Layout.Stack gap="xs">
                        <Typography.Text variant="m-600">Daily backup</Typography.Text>
                        Runs every day and is retained for 7 days
                    </Layout.Stack>
                </Card.Base>

                <Layout.Stack gap="xxs" direction="row" alignItems="center">
                    <Button
                        extraCompact
                        class="u-underline cursor-pointer"
                        on:click={() => {
                            isShowing = false;
                            $showCreatePolicy = false;
                            goto($upgradeURL);
                        }}>Upgrade your plan</Button> to add customized backup policies.
                </Layout.Stack>
            </Layout.Stack>
        {:else}
            <Layout.Stack gap="m">
                <InputSwitch
                    id="daily_backup"
                    label="Daily backups"
                    on:change={(event) => markPolicyChecked(event, dailyPolicy)}>
                    <Typography.Text variant="m-400" slot="description">
                        Daily backups are retained for 7 days.

                        <Link.Button
                            on:click={() => {
                                isShowing = false;
                                goto($upgradeURL);
                            }}>Upgrade your plan</Link.Button>
                        to add customized backup policies.
                    </Typography.Text>
                </InputSwitch>
            </Layout.Stack>
        {/if}
    {:else}
        <!-- show 2 preset and create custom policy button on Scale & up -->
        <Layout.Stack gap="m">
            <div class="grid-1-1 u-gap-12">
                {#each $presetPolicies as policy, index (index)}
                    <label for={index.toString()} class="card preset-label-card is-allow-focus">
                        <Layout.Stack gap="s" direction="row">
                            <InputCheckbox
                                id={index.toString()}
                                on:change={(event) => markPolicyChecked(event, policy)} />

                            <Layout.Stack gap="xxs">
                                <Typography.Text variant="m-600">{policy.label}</Typography.Text>
                                {policy.description}
                            </Layout.Stack>
                        </Layout.Stack>
                    </label>
                {/each}
            </div>

            {#if listOfCustomPolicies.length}
                <Layout.Stack gap="s">
                    {#each listOfCustomPolicies as policy}
                        <Card.Base padding="s">
                            <Layout.Stack gap="xs">
                                <Layout.Stack direction="row" justifyContent="space-between">
                                    <Typography.Text style="width: inherit" variant="m-600"
                                        >{policy.label}</Typography.Text>

                                    <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
                                        <Button
                                            extraCompact
                                            class="height-fit-content"
                                            on:click={() => {
                                                policyInEdit = policy.id;
                                                backupPolicyName = policy.label;
                                                selectedTime = policy.selectedTime;
                                                policyFrequency = policy.plainTextFrequency;
                                                monthlyBackupFrequency =
                                                    policy.monthlyBackupFrequency;
                                                daysSelectionArray = policy.weeklySelectedDays;
                                                policyRetention = !backupRetainingOptions.some(
                                                    (option) => option.value === policy.retained
                                                )
                                                    ? -1 // -1 is for custom policy
                                                    : policy.retained;

                                                // re-add if edit is cancelled
                                                policyBeingEdited = policy;

                                                // do not show in the list can cause confusion.
                                                listOfCustomPolicies = [
                                                    ...listOfCustomPolicies.filter(
                                                        (p) => policy.id !== p.id
                                                    )
                                                ];
                                            }}>
                                            <Icon icon={IconPencil} size="s" />
                                        </Button>

                                        <Button
                                            extraCompact
                                            class="height-fit-content"
                                            on:click={() => {
                                                listOfCustomPolicies = [
                                                    ...listOfCustomPolicies.filter(
                                                        (p) => policy.id !== p.id
                                                    )
                                                ];
                                            }}>
                                            <Icon icon={IconTrash} size="s" />
                                        </Button>
                                    </Layout.Stack>
                                </Layout.Stack>

                                <span>{customPolicyDescription(policy)}</span>
                            </Layout.Stack>
                        </Card.Base>
                    {/each}
                </Layout.Stack>
            {/if}

            {#if showCustomPolicy || policyInEdit}
                <Card.Base
                    variant="secondary"
                    padding="s"
                    --input-background-color="var(--bgcolor-neutral-primary)">
                    <div>
                        <div class="u-flex-vertical u-gap-24">
                            <div class="u-flex-vertical u-gap-4">
                                <Layout.Grid columns={4}>
                                    {#each frequencyOptions as frequency}
                                        <Tag
                                            size="s"
                                            selected={frequency.value === policyFrequency}
                                            on:click={() => {
                                                policyFrequency = frequency.value;
                                            }}>
                                            {frequency.label}
                                        </Tag>
                                    {/each}
                                </Layout.Grid>
                            </div>

                            {#if policyFrequency !== 'hourly'}
                                <Layout.Stack gap="s">
                                    <div class="time-holder">
                                        {#if policyFrequency === 'monthly'}
                                            <InputSelect
                                                id="monthly"
                                                label="Monthly timing"
                                                bind:value={monthlyBackupFrequency}
                                                placeholder="End of month (28th)"
                                                options={backupFrequencies[policyFrequency]} />
                                        {:else if policyFrequency === 'weekly'}
                                            <Layout.Stack gap="s">
                                                <Label class="timing-label">Timing</Label>

                                                <InputSelectCheckbox
                                                    name="Timing"
                                                    bind:tags={daysSelectionArray}
                                                    placeholder="Select weekdays"
                                                    options={backupFrequencies[policyFrequency].map(
                                                        (option) => ({
                                                            ...option,
                                                            checked: daysSelectionArray.includes(
                                                                option.value
                                                            )
                                                        })
                                                    )} />
                                            </Layout.Stack>
                                        {/if}

                                        <div
                                            class="input-time"
                                            class:hide={policyFrequency === 'monthly' ||
                                                policyFrequency === 'weekly'}
                                            class:u-margin-block-start-32={!$isSmallViewport &&
                                                (policyFrequency === 'monthly' ||
                                                    policyFrequency === 'weekly')}>
                                            <InputTime
                                                id="time"
                                                step={null}
                                                bind:value={selectedTime}
                                                label={['daily'].includes(policyFrequency)
                                                    ? 'Timing'
                                                    : ''} />
                                        </div>
                                    </div>

                                    <Typography.Text>{formPolicyDescription()}</Typography.Text>
                                </Layout.Stack>
                            {/if}

                            <div class="u-flex-vertical u-gap-8">
                                <InputSelect
                                    id="retention"
                                    label="Keep for"
                                    placeholder="3 months"
                                    bind:value={policyRetention}
                                    options={backupRetainingOptions} />
                                <span class="u-flex u-flex-vertical u-gap-8">
                                    {#if customRetentionEnabled}
                                        <div class="u-flex-vertical u-gap-2">
                                            <div class="u-flex u-gap-8">
                                                <div class="u-width-150">
                                                    <InputNumber
                                                        min={1}
                                                        id="number"
                                                        placeholder="11"
                                                        max={customRetention.max}
                                                        bind:value={customRetention.number} />
                                                </div>

                                                <InputSelect
                                                    id="retention"
                                                    placeholder="Months"
                                                    options={customRetainingOptions}
                                                    bind:value={customRetention.value} />
                                            </div>
                                            {#if policyInputError}
                                                <Helper type="warning"
                                                    >Value should be between 1 and {customRetention.max}</Helper>
                                            {/if}
                                        </div>
                                    {/if}
                                    <span>
                                        {#if policyRetention === 365 * 100}
                                            Every backup created under this policy will be retained <b
                                                >forever</b
                                            >.
                                        {:else}
                                            {@const period =
                                                backupRetainingOptions.find(
                                                    (option) => option.value === policyRetention
                                                )?.label ?? '3 months'}

                                            {@const description =
                                                period === 'Custom'
                                                    ? `${customRetention.number} ${
                                                          customRetention.number === 1
                                                              ? customRetention.label.slice(0, -1)
                                                              : customRetention.label
                                                      }`
                                                    : period}

                                            {#if (period === 'Custom' && customRetention.number !== null && customRetention.number !== 0) || period !== 'Custom'}
                                                Every backup created under this policy will be
                                                retained for <b>
                                                    {description}
                                                </b> before being automatically deleted.
                                            {/if}
                                        {/if}
                                    </span>
                                </span>
                            </div>

                            <div>
                                <InputText
                                    id="name"
                                    label="Policy name"
                                    placeholder="{capitalize(policyFrequency)} backup"
                                    autofocus
                                    bind:value={backupPolicyName}
                                    required />

                                {#if policyNameError}
                                    <Helper type="warning">This field is required</Helper>
                                {/if}
                            </div>

                            <div class="button-container u-main-end u-flex u-gap-8">
                                <Button
                                    text
                                    size="xs"
                                    on:click={() => {
                                        policyInEdit = false;
                                        showCustomPolicy = false;

                                        if (policyBeingEdited) {
                                            listOfCustomPolicies = [
                                                ...listOfCustomPolicies,
                                                policyBeingEdited
                                            ];
                                        }
                                    }}
                                    >Cancel
                                </Button>

                                <Button
                                    size="xs"
                                    secondary
                                    on:click={() => {
                                        if (!backupPolicyName) {
                                            policyNameError = true;
                                            return;
                                        }

                                        if (policyInputError) {
                                            return;
                                        }

                                        policyNameError = false;
                                        handleSavePolicy();
                                    }}>
                                    {policyInEdit ? 'Update' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card.Base>
            {:else}
                <div class="custom-policy-wrapper u-padding-inline-4 u-width-full-line">
                    <Button
                        size="s"
                        extraCompact
                        class="u-underline"
                        on:click={() => (showCustomPolicy = true)}
                        >Create custom policy
                    </Button>
                </div>
            {/if}
        </Layout.Stack>
    {/if}
</div>

<style>
    .card {
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .time-holder {
        gap: 8px;
        display: flex;
    }

    .preset-label-card {
        border: solid 0.0625rem #eeeef1;
    }

    .preset-label-card:hover {
        border: solid 0.0625rem #d7d7da;
    }

    /* taken from pink 2 */
    :global(.timing-label) {
        font-style: normal;
        font-weight: 500;
        line-height: 140%;
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }

    :global(.theme-dark) .preset-label-card {
        border: solid 0.0625rem #2c2c30;
    }

    :global(.theme-dark) .preset-label-card:hover {
        border: solid 0.0625rem #424248;
    }

    :global(.height-fit-content) {
        height: fit-content;
    }

    :global(.time-holder .input-time input[type='time']) {
        padding-block: 0.34rem !important;
    }

    @media (max-width: 767.99px) {
        .time-holder {
            gap: 1rem;
            flex-direction: column;
        }

        .input-time {
            margin-block-start: 0 !important;
        }

        /* week days selector */
        :global(.tags-input) {
            padding-right: unset !important;
        }
    }
</style>
