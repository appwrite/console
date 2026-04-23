<script lang="ts">
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { InputPhone, InputOTP, Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { getChangePlanUrl } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { currentPlan } from '$lib/stores/organization';
    import { isCloud, isSelfHosted } from '$lib/system';
    import MockNumbersLight from './mock-numbers-light.png';
    import MockNumbersDark from './mock-numbers-dark.png';
    import EmptyCardImageCloud from '$lib/components/emptyCardImageCloud.svelte';
    import { app } from '$lib/stores/app';
    import Empty from '$lib/components/empty.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Input, Layout, Link, Tooltip } from '@appwrite.io/pink-svelte';
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

    let numbers: MockNumberForm[] = $state(getMockNumberRows(project?.authMockNumbers ?? []));
    let lastProjectId: string = $state(project?.$id ?? null);
    let pendingRow: string | null = $state(null);

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
            numbers = getMockNumberRows(project?.authMockNumbers ?? []);
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

    function getRowKey(number: MockNumberForm, index: number) {
        return number.initialNumber ?? `new-${index}`;
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
        return !isSaved(number) || number.otp !== number.initialOtp;
    }

    function setRow(index: number, number: Models.MockNumber) {
        numbers = numbers.map((row, rowIndex) =>
            rowIndex === index
                ? {
                      number: number.number,
                      otp: number.otp,
                      initialNumber: number.number,
                      initialOtp: number.otp
                  }
                : row
        );
    }

    async function createPhoneNumber(number: MockNumberForm, index: number) {
        const rowKey = getRowKey(number, index);
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            pendingRow = rowKey;
            const mockNumber = await projectSdk.createMockPhone({
                number: number.number,
                otp: number.otp
            });

            setRow(index, mockNumber);
            addNotification({ type: 'success', message: 'Mock phone numbers have been updated' });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            await invalidate(Dependencies.PROJECT);
            pendingRow = null;
        }
    }

    async function updatePhoneNumber(number: MockNumberForm, index: number) {
        if (!number.initialNumber) return;

        const rowKey = getRowKey(number, index);
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            pendingRow = rowKey;
            const mockNumber = await projectSdk.updateMockPhone({
                number: number.initialNumber,
                otp: number.otp
            });

            setRow(index, mockNumber);
            addNotification({ type: 'success', message: 'Mock phone numbers have been updated' });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            await invalidate(Dependencies.PROJECT);
            pendingRow = null;
        }
    }

    async function deletePhoneNumber(number: MockNumberForm, index: number) {
        if (!number.initialNumber) {
            numbers = numbers.filter((_, rowIndex) => rowIndex !== index);
            return;
        }

        const rowKey = getRowKey(number, index);
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            pendingRow = rowKey;
            await projectSdk.deleteMockPhone({ number: number.initialNumber });

            numbers = numbers.filter((_, rowIndex) => rowIndex !== index);
            addNotification({ type: 'success', message: 'Mock phone number has been deleted' });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AuthMockNumbersUpdate);
        } finally {
            await invalidate(Dependencies.PROJECT);
            pendingRow = null;
        }
    }

    function addPhoneNumber(number: MockNumberForm) {
        numbers = [...numbers, { number: number.number, otp: number.otp }];
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
        {:else if numbers?.length > 0}
            {#each numbers as number, index}
                <Layout.Stack direction="row" alignItems="flex-end">
                    <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                        <InputPhone
                            id={`key-${index}`}
                            bind:value={number.number}
                            placeholder="Enter phone number"
                            label={index === 0 ? 'Phone number' : undefined}
                            minlength={9}
                            maxlength={16}
                            disabled={isSaved(number)}
                            required />
                        {#if !isSaved(number)}
                            <Tooltip>
                                <Button
                                    icon
                                    compact
                                    ariaLabel="Regenerate phone number"
                                    on:click={() => (number.number = generateNumber())}>
                                    <Icon icon={IconRefresh} size="s" />
                                </Button>
                                <span slot="tooltip">Regenerate</span>
                            </Tooltip>
                        {/if}
                    </Layout.Stack>
                    <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                        <InputOTP
                            id={`value-${index}`}
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
                                    pendingRow === getRowKey(number, index)}
                                on:click={() => updatePhoneNumber(number, index)}>
                                Update
                            </Button>
                        {:else}
                            <Button
                                compact
                                disabled={!isValid(number) ||
                                    pendingRow === getRowKey(number, index)}
                                on:click={() => createPhoneNumber(number, index)}>
                                Create
                            </Button>
                        {/if}
                        <Button
                            icon
                            compact
                            danger={isSaved(number)}
                            disabled={pendingRow === getRowKey(number, index)}
                            ariaLabel="Delete mock phone number"
                            on:click={() => {
                                deletePhoneNumber(number, index);
                            }}>
                            <Icon icon={IconTrash} size="s" />
                        </Button>
                    </Layout.Stack>
                </Layout.Stack>
            {/each}
            {#if numbers?.length < 10}
                <div>
                    <Button
                        secondary
                        on:click={() =>
                            addPhoneNumber({
                                number: generateNumber(),
                                otp: generateOTP()
                            })}
                        disabled={numbers.length >= 10}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add number
                    </Button>
                </div>
            {/if}
        {:else}
            <Empty
                on:click={() => {
                    addPhoneNumber({
                        number: generateNumber(),
                        otp: generateOTP()
                    });
                }}>Generate number</Empty>
        {/if}
    </svelte:fragment>
</CardGrid>
