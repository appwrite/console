<script lang="ts">
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import Confirm from '$lib/components/confirm.svelte';
    import { InputPhone, InputOTP, Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { getChangePlanUrl } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { currentPlan } from '$lib/stores/organization';
    import { isCloud, isSelfHosted } from '$lib/system';
    import MockNumbersLight from './mock-numbers-light.png';
    import MockNumbersDark from './mock-numbers-dark.png';
    import EmptyCardImageCloud from '$lib/components/emptyCardImageCloud.svelte';
    import { app } from '$lib/stores/app';
    import Empty from '$lib/components/empty.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Input, Layout, Link, Spinner, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';

    const {
        project
    }: {
        project: Models.Project;
    } = $props();

    type MockNumberForm = Pick<Models.MockNumber, 'number' | 'otp'> & {
        initialNumber?: string;
        initialOtp?: string;
    };

    let savedNumbers: MockNumberForm[] = $state([]);
    let draftNumbers: MockNumberForm[] = $state([]);
    let isLoadingMockNumbers = $state(false);
    let lastProjectId: string | null = $state(null);
    let pendingRow: string | null = $state(null);
    let showDeleteConfirm = $state(false);
    let deleteTargetIndex: number | null = $state(null);
    let deleteError: string | null = $state(null);

    const isComponentDisabled = $derived(
        isSelfHosted || (isCloud && !$currentPlan.supportsMockNumbers)
    );

    const emptyStateTitle = $derived(
        isSelfHosted ? 'Available on Appwrite Cloud' : 'Upgrade to add mock phone numbers'
    );

    const emptyStateDescription = $derived(
        isSelfHosted
            ? 'Sign up for Cloud to add mock phone numbers to your projects.'
            : 'Upgrade to a Pro plan to add mock phone numbers to your project.'
    );

    const cta = $derived(isSelfHosted ? 'Sign up' : 'Upgrade plan');

    $effect(() => {
        const id = project?.$id ?? null;
        if (id && id !== lastProjectId) {
            lastProjectId = id;
            void loadMockNumbers();
        }
    });

    function getMockNumberRows(mockNumbers: Models.MockNumber[]): MockNumberForm[] {
        return mockNumbers.map(({ number, otp }) => ({
            number,
            otp,
            initialNumber: number,
            initialOtp: otp
        }));
    }

    async function loadMockNumbers() {
        try {
            if (savedNumbers.length === 0) {
                isLoadingMockNumbers = true;
            }
            const response = await sdk
                .forProject(project.region, project.$id)
                .project.listMockPhones({});
            savedNumbers = getMockNumberRows(response.mockNumbers ?? []);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            isLoadingMockNumbers = false;
        }
    }

    function getSavedRowKey(number: MockNumberForm, index: number) {
        return number.initialNumber ?? number.number ?? `saved-${index}`;
    }

    function getDraftRowKey(index: number) {
        return `draft-${index}`;
    }

    function isSaved(number: MockNumberForm) {
        return Boolean(number.initialNumber);
    }

    function isValid(number: MockNumberForm) {
        return (
            number.number?.length >= 9 &&
            number.number?.length <= 16 &&
            /^[0-9]{6}$/.test(number.otp ?? '')
        );
    }

    function isChanged(number: MockNumberForm) {
        return (
            !isSaved(number) ||
            number.number !== number.initialNumber ||
            number.otp !== number.initialOtp
        );
    }

    function setSavedRow(initialNumber: string, mockNumber: Models.MockNumber) {
        savedNumbers = savedNumbers.map((row) =>
            row.initialNumber === initialNumber
                ? {
                      number: mockNumber.number,
                      otp: mockNumber.otp,
                      initialNumber: mockNumber.number,
                      initialOtp: mockNumber.otp
                  }
                : row
        );
    }

    function setDraftRow(index: number, nextValue: MockNumberForm) {
        draftNumbers = draftNumbers.map((row, rowIndex) => (rowIndex === index ? nextValue : row));
    }

    async function createPhoneNumber(number: MockNumberForm, index: number) {
        const rowKey = getDraftRowKey(index);
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            pendingRow = rowKey;
            await projectSdk.createMockPhone({
                number: number.number,
                otp: number.otp
            });

            draftNumbers = draftNumbers.filter((_, rowIndex) => rowIndex !== index);
            await loadMockNumbers();
            addNotification({ type: 'success', message: 'Mock phone numbers have been updated' });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            pendingRow = null;
        }
    }

    async function updatePhoneNumber(number: MockNumberForm, index: number) {
        if (!number.initialNumber) return;

        const rowKey = getSavedRowKey(number, index);
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            pendingRow = rowKey;
            const mockNumber = await projectSdk.updateMockPhone({
                number: number.initialNumber,
                otp: number.otp
            });

            setSavedRow(number.initialNumber, mockNumber);
            await loadMockNumbers();
            addNotification({ type: 'success', message: 'Mock phone numbers have been updated' });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            pendingRow = null;
        }
    }

    async function deletePhoneNumber(number: MockNumberForm, index: number) {
        if (!number.initialNumber) {
            draftNumbers = draftNumbers.filter((_, rowIndex) => rowIndex !== index);
            return;
        }

        const rowKey = getSavedRowKey(number, index);
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            pendingRow = rowKey;
            await projectSdk.deleteMockPhone({ number: number.initialNumber });

            savedNumbers = savedNumbers.filter((row) => row.initialNumber !== number.initialNumber);
            await loadMockNumbers();
            addNotification({ type: 'success', message: 'Mock phone number has been deleted' });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            deleteError = error.message;
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            pendingRow = null;
        }
    }

    function addPhoneNumber() {
        draftNumbers = [
            ...draftNumbers,
            {
                number: generateNumber(),
                otp: generateOTP()
            }
        ];
    }

    function generateNumber(): string {
        const areaCode = Math.floor(Math.random() * 800) + 200;
        const lineNumber = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `+1${areaCode}555${lineNumber}`;
    }

    function generateOTP(): string {
        return String(Math.floor(100000 + Math.random() * 900000));
    }

    function getDeleteTargetRow() {
        return deleteTargetIndex === null ? null : (savedNumbers[deleteTargetIndex] ?? null);
    }

    function isDeletePending() {
        const row = getDeleteTargetRow();
        return (
            row !== null &&
            deleteTargetIndex !== null &&
            pendingRow === getSavedRowKey(row, deleteTargetIndex)
        );
    }

    function promptDelete(index: number) {
        deleteTargetIndex = index;
        deleteError = null;
        showDeleteConfirm = true;
    }

    async function confirmDeletePhoneNumber() {
        const row = getDeleteTargetRow();
        if (row === null || deleteTargetIndex === null) return;

        await deletePhoneNumber(row, deleteTargetIndex);

        if (!deleteError) {
            showDeleteConfirm = false;
            deleteTargetIndex = null;
        }
    }
</script>

<CardGrid hideFooter>
    <svelte:fragment slot="title">Mock phone numbers</svelte:fragment>
    Generate <b>fictional</b> numbers to simulate phone verification when testing demo accounts for
    submitting your application to the App Store or Google Play.
    <Link.Anchor
        href="https://appwrite.io/docs/products/auth/security#mock-phone-numbers"
        target="_blank"
        rel="noopener noreferrer">
        Learn more</Link.Anchor>
    <svelte:fragment slot="aside">
        {#if isComponentDisabled}
            <EmptyCardImageCloud responsive source="email_signature_card">
                <svelte:fragment slot="image">
                    <div class=" is-only-mobile u-width-full-line u-height-100-percent">
                        {#if $app.themeInUse === 'dark'}
                            <img
                                src={MockNumbersDark}
                                class="u-image-object-fit-cover u-only-dark u-width-full-line u-height-100-percent"
                                alt="Mock Numbers Example" />
                        {:else}
                            <img
                                src={MockNumbersLight}
                                class="u-image-object-fit-cover u-only-light u-width-full-line u-height-100-percent"
                                alt="Mock Numbers Example" />
                        {/if}
                    </div>
                    <div
                        class="is-not-mobile"
                        style:background-color="var(--bgcolor-neutral-default)">
                        <Layout.Stack justifyContent="center" direction="row">
                            {#if $app.themeInUse === 'dark'}
                                <img
                                    src={MockNumbersDark}
                                    width="266"
                                    style:object-position="top"
                                    alt="Mock Numbers Example" />
                            {:else}
                                <img
                                    src={MockNumbersLight}
                                    width="266"
                                    style:object-position="top"
                                    alt="Mock Numbers Example" />
                            {/if}
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="title">{emptyStateTitle}</svelte:fragment>
                {emptyStateDescription}
                <svelte:fragment let:source slot="cta">
                    <Button
                        secondary
                        fullWidth
                        external={isSelfHosted}
                        href={isCloud
                            ? getChangePlanUrl(project.teamId)
                            : 'https://cloud.appwrite.io/register'}
                        on:click={() => {
                            trackEvent(Click.CloudSignupClick, {
                                from: 'button',
                                source
                            });
                        }}>{cta}</Button>
                </svelte:fragment>
            </EmptyCardImageCloud>
        {:else if isLoadingMockNumbers}
            <Layout.Stack direction="row" justifyContent="center">
                <Spinner />
            </Layout.Stack>
        {:else if savedNumbers.length > 0 || draftNumbers.length > 0}
            {#each savedNumbers as number, index (getSavedRowKey(number, index))}
                <Layout.Stack direction="row" alignItems="flex-end">
                    <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                        <InputPhone
                            id={`saved-key-${index}`}
                            bind:value={number.number}
                            placeholder="Enter phone number"
                            label={index === 0 ? 'Phone number' : undefined}
                            minlength={9}
                            maxlength={16}
                            disabled={isSaved(number)}
                            required />
                    </Layout.Stack>
                    <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                        <InputOTP
                            id={`saved-value-${index}`}
                            bind:value={number.otp}
                            placeholder="Enter value"
                            label={index === 0 ? 'Verification code' : undefined}
                            maxlength={6}
                            pattern={'^[0-9]{6}$'}
                            patternError="The value must contain 6 digits"
                            required>
                            <Tooltip slot="end">
                                <Input.Action
                                    icon={IconRefresh}
                                    on:click={() => (number.otp = generateOTP())} />
                                <span slot="tooltip">Regenerate</span>
                            </Tooltip>
                        </InputOTP>
                        {#if isSaved(number)}
                            <Button
                                compact
                                disabled={!isChanged(number) ||
                                    !isValid(number) ||
                                    pendingRow === getSavedRowKey(number, index)}
                                on:click={() => updatePhoneNumber(number, index)}>
                                Save
                            </Button>
                        {/if}
                        <Button
                            icon
                            text
                            disabled={pendingRow === getSavedRowKey(number, index)}
                            ariaLabel="Delete mock phone number"
                            on:click={() => promptDelete(index)}>
                            <Icon icon={IconTrash} size="s" />
                        </Button>
                        {#if pendingRow === getSavedRowKey(number, index)}
                            <span style:opacity="0.75">
                                <Spinner size="s" />
                            </span>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            {/each}
            {#each draftNumbers as number, index (getDraftRowKey(index))}
                <Layout.Stack direction="row" alignItems="flex-end">
                    <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                        <InputPhone
                            id={`draft-key-${index}`}
                            bind:value={number.number}
                            placeholder="Enter phone number"
                            label={savedNumbers.length === 0 && index === 0
                                ? 'Phone number'
                                : undefined}
                            minlength={9}
                            maxlength={16}
                            required>
                            <Tooltip slot="end">
                                <Input.Action
                                    icon={IconRefresh}
                                    on:click={() =>
                                        setDraftRow(index, {
                                            ...number,
                                            number: generateNumber()
                                        })} />
                                <span slot="tooltip">Regenerate</span>
                            </Tooltip>
                        </InputPhone>
                    </Layout.Stack>
                    <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                        <InputOTP
                            id={`draft-value-${index}`}
                            bind:value={number.otp}
                            placeholder="Enter value"
                            label={savedNumbers.length === 0 && index === 0
                                ? 'Verification code'
                                : undefined}
                            maxlength={6}
                            pattern={'^[0-9]{6}$'}
                            patternError="The value must contain 6 digits"
                            required>
                            <Tooltip slot="end">
                                <Input.Action
                                    icon={IconRefresh}
                                    on:click={() =>
                                        setDraftRow(index, { ...number, otp: generateOTP() })} />
                                <span slot="tooltip">Regenerate</span>
                            </Tooltip>
                        </InputOTP>
                        <Button
                            compact
                            disabled={!isValid(number) || pendingRow === getDraftRowKey(index)}
                            on:click={() => createPhoneNumber(number, index)}>
                            Save
                        </Button>
                        <Button
                            icon
                            text
                            disabled={pendingRow === getDraftRowKey(index)}
                            ariaLabel="Delete mock phone number"
                            on:click={() => deletePhoneNumber(number, index)}>
                            <Icon icon={IconTrash} size="s" />
                        </Button>
                        {#if pendingRow === getDraftRowKey(index)}
                            <span style:opacity="0.75">
                                <Spinner size="s" />
                            </span>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            {/each}
            {#if savedNumbers.length + draftNumbers.length < 10}
                <div>
                    <Button
                        secondary
                        on:click={addPhoneNumber}
                        disabled={savedNumbers.length + draftNumbers.length >= 10}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add number
                    </Button>
                </div>
            {/if}
        {:else}
            <Empty on:click={addPhoneNumber}>Add a number</Empty>
        {/if}
    </svelte:fragment>
</CardGrid>

<Confirm
    bind:open={showDeleteConfirm}
    bind:error={deleteError}
    title="Delete mock phone number"
    action="Delete"
    submissionLoader
    disabled={isDeletePending()}
    onSubmit={confirmDeletePhoneNumber}>
    {#if getDeleteTargetRow()}
        <p>
            Are you sure you want to delete <b>{getDeleteTargetRow()?.initialNumber}</b>?
        </p>
    {/if}
</Confirm>
