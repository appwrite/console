<script lang="ts">
    import { Modal } from '$lib/components';
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
    import { backupRetainingOptions, database } from '../store';
    import { policyPricing, presetPolicies } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import {
        backupFrequencies,
        backupPolicyDescription,
        cronExpression,
        type UserBackupPolicy
    } from '$lib/helpers/backups';

    export let isModal = true;
    export let showCreate = false;

    export let title: string | undefined = undefined;
    export let subtitle: string | undefined = undefined;
    export let totalPolicies: UserBackupPolicy[] = [];

    let showCustomPolicy = false;
    let customPolicySection: HTMLElement;
    let listOfCustomPolicies: UserBackupPolicy[] = [];
    $: totalPolicies = [
        ...listOfCustomPolicies,
        ...$presetPolicies.filter((policy) => policy.checked)
    ];

    let error: string;
    let policyInEdit = null;
    let policyRetention = 30;
    let selectedTime = '00:00';
    let backupPolicyName = null;
    let policyNameError: boolean;
    let policyFrequency = 'monthly';
    let monthlyBackupFrequency = 'end';

    const resetFormVariables = () => {
        error = null;
        policyInEdit = null;
        policyRetention = 30;
        selectedTime = '00:00';
        backupPolicyName = null;
        policyFrequency = 'monthly';
        monthlyBackupFrequency = 'end';
    };

    export const createPolicies = async () => {
        const totalPoliciesPromise = totalPolicies.map((policy) => {
            cronExpression(policy);

            return sdk.forProject.backups.createPolicy(
                policy.id,
                ['databases'],
                policy.retained,
                policy.schedule,
                policy.label,
                $database.$id
            );
        });

        try {
            await Promise.all(totalPoliciesPromise);

            addNotification({
                isHtml: true,
                type: 'success',
                message: `Backup  ${totalPoliciesPromise.length > 1 ? 'policies' : 'policy'} created`
            });

            showCreate = false;
            resetFormVariables();
            listOfCustomPolicies = [];
            invalidate(Dependencies.BACKUPS);
        } catch (err) {
            addNotification({
                type: 'error',
                message: err.message
            });
        }
    };

    const handleSavePolicy = () => {
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

    $: if (!showCreate) {
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
</script>

{#if isModal}
    <Modal
        title="Create backup policy"
        size="big"
        bind:show={showCreate}
        onSubmit={createPolicies}
        bind:error>
        <FormList>
            <div class="u-flex-vertical u-gap-12">
                <div class="grid-1-1 u-gap-12">
                    {#each $presetPolicies as policy, index (index)}
                        <div class="card policy-default-custom-card">
                            <div class="u-flex u-gap-8 body-text-2">
                                <InputCheckbox
                                    id={index.toString()}
                                    on:change={(event) =>
                                        (policy.checked = event.target.checked)} />

                                <div class="u-flex-vertical u-gap-4">
                                    <div class="u-flex u-gap-4">
                                        <h3 class="u-bold">{policy.label}</h3>
                                        <span class="inline-tag">$20.00</span>
                                    </div>

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
                                        <h3 class="body-text-2 u-bold">{policy.label}</h3>

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
                                                    label="Monthly Timing"
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
                                                    label={['daily', 'weekly'].includes(
                                                        policyFrequency
                                                    )
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
                                        {#if policyRetention === 365 * 100}
                                            Every backup created under this policy will be retained <b
                                                >forever</b
                                            >.
                                        {:else}
                                            Every backup created under this policy will be retained
                                            for <b>
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
                        <button
                            class="custom-policy-text"
                            on:click={() => (showCustomPolicy = true)}
                            >Custom policy
                        </button>
                        <span>Total: ${totalPolicies.length * policyPricing}.00</span>
                    </div>
                {/if}
            </div>
        </FormList>

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit disabled={!totalPolicies.length}>Create</Button>
        </svelte:fragment>
    </Modal>
{:else}
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
                                    on:change={(event) =>
                                        (policy.checked = event.target.checked)} />

                                <div class="u-flex-vertical u-gap-4">
                                    <div class="u-flex u-gap-4">
                                        <h3 class="u-bold">{policy.label}</h3>
                                        <span class="inline-tag">$20.00</span>
                                    </div>

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
                                        <h3 class="body-text-2 u-bold">{policy.label}</h3>

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
                                                    label="Monthly Timing"
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
                                                    label={['daily', 'weekly'].includes(
                                                        policyFrequency
                                                    )
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
                                        {#if policyRetention === 365 * 100}
                                            Every backup created under this policy will be retained <b
                                                >forever</b
                                            >.
                                        {:else}
                                            Every backup created under this policy will be retained
                                            for <b>
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
                        <button
                            class="custom-policy-text"
                            on:click={() => (showCustomPolicy = true)}
                            >Custom policy
                        </button>
                        <span>Total: ${totalPolicies.length * policyPricing}.00</span>
                    </div>
                {/if}
            </div>
        </FormList>
    </div>
{/if}

<style>
    .card {
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .policy-default-custom-card {
        background: #fafafb;
    }

    :global(.theme-dark) .policy-default-custom-card {
        background: #232325;
    }

    .inline-tag {
        text-align: center;
        font-style: normal;
        font-weight: 400;
        line-height: 140%;
        letter-spacing: -0.063px;
        text-decoration-line: line-through;
        font-size: var(--font-size-S, 14px);
        font-family: var(--font-family-sansSerif, Inter);
    }

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
