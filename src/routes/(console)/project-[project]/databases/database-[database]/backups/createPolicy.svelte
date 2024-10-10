<script lang="ts">
    import {
        Button,
        FormList,
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
    import { BillingPlan } from '@appwrite.io/console';
    import { Card } from '$lib/components';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';

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
    let policyRetention = 30;
    let selectedTime = '00:00';
    let policyNameError: boolean;
    let policyFrequency = 'monthly';
    let monthlyBackupFrequency = 'end';

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

    const markPolicyChecked = (event: Event, policy: UserBackupPolicy) => {
        const isChecked = (event.target as HTMLInputElement).checked;

        presetPolicies.update((all) => {
            return all.map((p) => {
                if (p.label === policy.label) {
                    return { ...p, checked: isChecked };
                }
                return p;
            });
        });
    };

    $: customPolicyDescription = (policy: UserBackupPolicy) => {
        return backupPolicyDescription(
            policy.plainTextFrequency,
            null,
            policy.retained,
            policy.monthlyBackupFrequency,
            policy.weeklySelectedDays
        );
    };

    $: formPolicyDescription = () => {
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
        if ($organization.billingPlan === BillingPlan.Tier1 && isFromBackupsTab) {
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
</script>

<div class="u-flex-vertical u-gap-16">
    {#if $organization.billingPlan === BillingPlan.Tier2}
        {#if title || subtitle}
            <div class="body-text-2">
                {#if title}
                    <h3 class="u-bold">{title}</h3>
                {/if}

                {#if subtitle}
                    <span>{subtitle}</span>
                {/if}
            </div>
        {/if}
    {/if}

    <FormList>
        <!-- because we show a set of pre-defined ones -->
        {#if $organization.billingPlan === BillingPlan.Tier1}
            {@const dailyPolicy = $presetPolicies[1]}

            {#if isFromBackupsTab}
                <div class="u-flex-vertical u-gap-8">
                    <Card
                        isTile
                        class="restore-modal-inner-card"
                        style="border-radius: var(--border-radius-small, 8px); padding: 1rem;">
                        <div class="u-flex u-flex-vertical u-gap-4">
                            <span class="body-text-2 u-bold darker-neutral-color">
                                Daily backup
                            </span>
                            <span>Runs every day and is retained for 7 days</span>
                        </div>
                    </Card>
                    <span>
                        <button
                            type="button"
                            class="u-underline cursor-pointer"
                            on:click={() => {
                                isShowing = false;
                                $showCreatePolicy = false;
                                wizard.start(SupportWizard);
                            }}>Contact support</button> to upgrade your plan and add customized backup
                        policies.
                    </span>
                </div>
            {:else}
                <div class="u-flex u-gap-8 body-text-2">
                    <InputSwitch
                        id="daily_backup"
                        label="Daily backups"
                        on:change={(event) => markPolicyChecked(event, dailyPolicy)}>
                        <svelte:fragment slot="description">
                            <span>
                                Daily backups are retained for 7 days.
                                <button
                                    type="button"
                                    class="u-underline cursor-pointer"
                                    on:click={() => {
                                        isShowing = false;
                                        wizard.start(SupportWizard);
                                    }}>Contact support</button>
                                to upgrade your plan and add customized backup policies.
                            </span>
                        </svelte:fragment>
                    </InputSwitch>
                </div>
            {/if}
        {:else}
            <!-- show 2 preset and create custom policy button on Scale & up -->
            <div class="u-flex-vertical u-gap-12">
                <div class="grid-1-1 u-gap-12">
                    {#each $presetPolicies as policy, index (index)}
                        <label for={index.toString()} class="card preset-label-card is-allow-focus">
                            <div class="u-flex u-gap-8 body-text-2">
                                <InputCheckbox
                                    id={index.toString()}
                                    on:change={(event) => markPolicyChecked(event, policy)} />

                                <div class="u-flex-vertical u-gap-4">
                                    <h3 class="u-bold">{policy.label}</h3>
                                    {policy.description}
                                </div>
                            </div>
                        </label>
                    {/each}
                </div>

                {#if listOfCustomPolicies.length}
                    <div class="u-flex-vertical u-gap-8">
                        {#each listOfCustomPolicies as policy}
                            <div class="card custom-policy-card">
                                <div class="u-flex-vertical u-gap-4 body-text-2">
                                    <div class="u-flex u-main-space-between">
                                        <h3 class="u-bold">{policy.label}</h3>

                                        <div class="u-flex u-gap-8">
                                            <Button
                                                text
                                                noMargin
                                                class="icon-pencil height-fit-content"
                                                on:click={() => {
                                                    policyInEdit = policy.id;
                                                    backupPolicyName = policy.label;
                                                    policyRetention = policy.retained;
                                                    selectedTime = policy.selectedTime;
                                                    policyFrequency = policy.plainTextFrequency;
                                                    monthlyBackupFrequency =
                                                        policy.monthlyBackupFrequency;
                                                    daysSelectionArray = policy.weeklySelectedDays;

                                                    // do not show in the list can cause confusion.
                                                    listOfCustomPolicies = [
                                                        ...listOfCustomPolicies.filter(
                                                            (p) => policy.id !== p.id
                                                        )
                                                    ];
                                                }} />

                                            <Button
                                                text
                                                noMargin
                                                class="icon-trash height-fit-content"
                                                on:click={() => {
                                                    listOfCustomPolicies = [
                                                        ...listOfCustomPolicies.filter(
                                                            (p) => policy.id !== p.id
                                                        )
                                                    ];
                                                }} />
                                        </div>
                                    </div>

                                    <span>{customPolicyDescription(policy)}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if showCustomPolicy || policyInEdit}
                    <section
                        bind:this={customPolicySection}
                        class="modal is-inner-modal u-width-full-line">
                        <div class="modal-form">
                            <div class="u-flex-vertical u-gap-24">
                                <div class="u-flex-vertical u-gap-4">
                                    <InputSelect
                                        label="Frequency"
                                        id="policyFrequency"
                                        placeholder="Select frequency"
                                        bind:value={policyFrequency}
                                        options={['hourly', 'daily', 'weekly', 'monthly'].map(
                                            (freq) => ({
                                                value: freq,
                                                label: freq.charAt(0).toUpperCase() + freq.slice(1)
                                            })
                                        )}
                                        required />
                                    {#if policyFrequency === 'hourly'}
                                        <span>{formPolicyDescription()}</span>
                                    {/if}
                                </div>

                                {#if policyFrequency !== 'hourly'}
                                    <div class="u-flex-vertical u-gap-8">
                                        <div class="time-holder">
                                            {#if policyFrequency === 'monthly'}
                                                <InputSelect
                                                    id="monthly"
                                                    label="Monthly timing"
                                                    bind:value={monthlyBackupFrequency}
                                                    placeholder="End of month (28th)"
                                                    fullWidth
                                                    options={backupFrequencies[policyFrequency]} />
                                            {:else if policyFrequency === 'weekly'}
                                                <div class="u-flex-vertical u-width-full-line">
                                                    <Label>Timing</Label>
                                                    <InputSelectCheckbox
                                                        name="Timing"
                                                        bind:tags={daysSelectionArray}
                                                        placeholder="Select weekdays"
                                                        options={backupFrequencies[
                                                            policyFrequency
                                                        ].map((option) => ({
                                                            ...option,
                                                            checked: daysSelectionArray.includes(
                                                                option.value
                                                            )
                                                        }))} />
                                                </div>
                                            {/if}

                                            <div
                                                class="input-time"
                                                class:hide={policyFrequency === 'monthly' ||
                                                    policyFrequency === 'weekly'}
                                                class:u-margin-block-start-4={policyFrequency ===
                                                    'monthly' || policyFrequency === 'weekly'}>
                                                <InputTime
                                                    id="time"
                                                    bind:value={selectedTime}
                                                    label={['daily'].includes(policyFrequency)
                                                        ? 'Timing'
                                                        : ''} />
                                            </div>
                                        </div>

                                        <span>{formPolicyDescription()}</span>
                                    </div>
                                {/if}

                                <div class="u-flex-vertical u-gap-8">
                                    <InputSelect
                                        fullWidth
                                        id="retention"
                                        label="Keep for"
                                        placeholder="3 months"
                                        bind:value={policyRetention}
                                        options={backupRetainingOptions} />
                                    <span class="u-flex u-flex-vertical u-gap-8">
                                        {#if customRetentionEnabled}
                                            <div class="u-flex u-gap-8 u-padding-block-start-12">
                                                <div class="u-width-150">
                                                    <InputNumber
                                                        min={1}
                                                        id="number"
                                                        placeholder="11"
                                                        max={customRetention.max}
                                                        bind:value={customRetention.number} />
                                                </div>

                                                <InputSelect
                                                    fullWidth
                                                    id="retention"
                                                    placeholder="Months"
                                                    options={customRetainingOptions}
                                                    bind:value={customRetention.value} />
                                            </div>
                                        {/if}
                                        <span>
                                            {#if policyRetention === 365 * 100}
                                                Every backup created under this policy will be
                                                retained <b>forever</b>.
                                            {:else}
                                                Every backup created under this policy will be
                                                retained for <b>
                                                    {backupRetainingOptions.find(
                                                        (option) => option.value === policyRetention
                                                    )?.label ?? '3 months'}
                                                </b> before being automatically deleted.
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

                                <div class="u-main-end u-flex u-gap-8">
                                    <Button
                                        text
                                        on:click={() => {
                                            showCustomPolicy = false;
                                        }}
                                        >Cancel
                                    </Button>

                                    <Button
                                        secondary
                                        on:click={() => {
                                            if (!backupPolicyName) {
                                                policyNameError = true;
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
                    </section>
                {:else}
                    <div class="custom-policy-wrapper u-padding-inline-4 u-width-full-line">
                        <button
                            type="button"
                            class="custom-policy-text"
                            on:click={() => (showCustomPolicy = true)}
                            >Create custom policy
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    </FormList>
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

    .custom-policy-text {
        color: #19191c;
        text-decoration: underline;
    }

    .custom-policy-card {
        background-color: #f9f9fa !important;
    }

    :global(.theme-dark) .preset-label-card {
        border: solid 0.0625rem #2c2c30;
    }

    :global(.theme-dark) .preset-label-card:hover {
        border: solid 0.0625rem #424248;
    }

    :global(.theme-dark) .custom-policy-text {
        color: #fff;
    }

    :global(.theme-dark) .custom-policy-card {
        background: #2c2c2f !important;
    }

    :global(.height-fit-content) {
        height: fit-content;
    }

    @media (max-width: 767.99px) {
        .time-holder {
            gap: 0;
            flex-direction: column;
        }

        :global(.time-holder .input-time.hide > li label) {
            display: none;
        }
    }
</style>
