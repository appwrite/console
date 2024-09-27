<script lang="ts">
    import {
        Button,
        FormList,
        Helper,
        InputCheckbox,
        InputSelect,
        InputText,
        InputTime
    } from '$lib/elements/forms';
    import { ID } from '@appwrite.io/console';
    import { capitalize } from '$lib/helpers/string';
    import { backupRetainingOptions, customRetainingOptions } from '../store';
    import { policyPricing, presetPolicies } from './store';
    import {
        backupFrequencies,
        backupPolicyDescription,
        type UserBackupPolicy
    } from '$lib/helpers/backups';
    import { InputNumber } from '$lib/elements/forms/index.js';

    export let isShowing: boolean;
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
    let backupPolicyName = null;
    let policyNameError: boolean;
    let policyFrequency = 'monthly';
    let monthlyBackupFrequency = 'end';

    $: customRetentionEnabled = policyRetention === -1;
    let customRetention = { ...customRetainingOptions[2], number: null };

    const resetFormVariables = () => {
        policyInEdit = null;
        policyRetention = 30;
        selectedTime = '00:00';
        backupPolicyName = null;
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
            description: `Runs every ${policyFrequency} and is retained for ${policyRetention}`
        };

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
            policy.monthlyBackupFrequency
        );
    };

    $: formPolicyDescription = () => {
        return backupPolicyDescription(policyFrequency, selectedTime, null, monthlyBackupFrequency);
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

    <FormList>
        <div class="u-flex-vertical u-gap-12">
            <div class="grid-1-1 u-gap-12">
                {#each $presetPolicies as policy, index (index)}
                    <div class="card policy-default-custom-card">
                        <div class="u-flex u-gap-8 body-text-2">
                            <InputCheckbox
                                id={index.toString()}
                                on:change={(event) => markPolicyChecked(event, policy)} />

                            <div class="u-flex-vertical u-gap-4">
                                <h3 class="u-bold">{policy.label}</h3>
                                {policy.description}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            {#if listOfCustomPolicies.length}
                <div class="u-flex-vertical u-gap-8">
                    {#each listOfCustomPolicies as policy}
                        <div class="card policy-default-custom-card">
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
                                    placeholder="Select runtime"
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
                                    <div class="u-flex u-gap-8 time-holder">
                                        {#if policyFrequency === 'monthly'}
                                            <InputSelect
                                                id="monthly"
                                                label="Monthly timing"
                                                bind:value={monthlyBackupFrequency}
                                                placeholder="End of month (28th)"
                                                fullWidth
                                                options={backupFrequencies[policyFrequency]} />
                                        {/if}

                                        <div
                                            class:u-margin-block-start-4={policyFrequency ===
                                                'monthly'}>
                                            <InputTime
                                                id="time"
                                                bind:value={selectedTime}
                                                label={['daily', 'weekly'].includes(policyFrequency)
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
                                <span>
                                    {#if customRetentionEnabled}
                                        <div class="u-flex u-gap-8 u-padding-block-start-12">
                                            <div class="u-width-150">
                                                <InputNumber
                                                    min={1}
                                                    id="number"
                                                    placeholder="08"
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

                                    {#if policyRetention === 365 * 100}
                                        Every backup created under this policy will be retained <b
                                            >forever</b
                                        >.
                                    {:else}
                                        Every backup created under this policy will be retained for <b>
                                            {backupRetainingOptions.find(
                                                (option) => option.value === policyRetention
                                            )?.label ?? '3 months'}
                                        </b> before being automatically deleted.
                                    {/if}
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
                <div class="u-flex u-main-space-between u-padding-inline-4 u-width-full-line">
                    <button class="custom-policy-text" on:click={() => (showCustomPolicy = true)}
                        >Create custom policy
                    </button>

                    <div>
                        <span>Total:</span>
                        {#if totalPolicies.length}
                            <span style="text-decoration: line-through;"
                                >${totalPolicies.length * policyPricing}
                                .00</span>
                        {/if}
                        <span>$0.00 until Nov 2024</span>
                    </div>
                </div>
            {/if}
        </div>
    </FormList>
</div>

<style>
    .card {
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .policy-default-custom-card {
        background: #fafafb;
    }

    /*.policy-default-custom-card.checked {*/
    /*    border: solid .0625rem hsl(var(--color-neutral-80))*/
    /*}*/

    :global(.theme-dark) .policy-default-custom-card {
        background: #232325;
    }

    /*:global(.theme-dark) .policy-default-custom-card.checked {*/
    /*    border: solid .0625rem hsl(var(--color-neutral-10))*/
    /*}*/

    .custom-policy-text {
        color: #19191c;
        text-decoration: underline;
    }

    :global(.theme-dark) .custom-policy-text {
        color: #fff;
    }

    :global(.height-fit-content) {
        height: fit-content;
    }
</style>
