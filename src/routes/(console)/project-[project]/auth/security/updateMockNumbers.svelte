<script lang="ts">
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { InputPhone, InputOTP } from '$lib/elements/forms';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { upgradeURL } from '$lib/stores/billing';
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
    import { IconPlus, IconRefresh } from '@appwrite.io/pink-icons-svelte';

    let numbers: Models.MockNumber[] = $project?.authMockNumbers ?? [];
    let initialNumbers = [];

    $: initialNumbers = $project?.authMockNumbers?.map((num) => ({ ...num })) ?? [];
    $: isSubmitDisabled = JSON.stringify(numbers) === JSON.stringify(initialNumbers);

    let isComponentDisabled: boolean =
        isSelfHosted || (isCloud && !$currentPlan.supportsMockNumbers);
    let emptyStateTitle: string = isSelfHosted
        ? 'Available on Appwrite Cloud'
        : 'Upgrade to add mock phone numbers';
    let emptyStateDescription: string = isSelfHosted
        ? 'Sign up for Cloud to add mock phone numbers to your projects.'
        : 'Upgrade to a Pro plan to add mock phone numbers to your project.';
    let cta: string = isSelfHosted ? 'Sign up' : 'Upgrade plan';

    async function updateMockNumbers() {
        try {
            await sdk.forConsole.projects.updateMockNumbers($project.$id, numbers);
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Mock phone numbers have been updated'
            });
            trackEvent(Submit.AuthMockNumbersUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthMockNumbersUpdate);
        }
    }

    function addPhoneNumber(number: Models.MockNumber) {
        numbers.push({
            phone: number.phone,
            otp: number.otp
        });
        numbers = numbers;
    }

    function deletePhoneNumber(index: number) {
        numbers.splice(index, 1);
        numbers = numbers;
    }

    function generateNumber(): string {
        const areaCode = Math.floor(Math.random() * 800) + 200;
        const lineNumber = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `+1${areaCode}555${lineNumber}`;
    }

    function generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000) + '';
    }
</script>

<Form onSubmit={updateMockNumbers}>
    <CardGrid hideFooter={isComponentDisabled}>
        <svelte:fragment slot="title">Mock phone numbers</svelte:fragment>
        Generate <b>fictional</b> numbers to simulate phone verification when testing demo accounts
        for submitting your application to the App Store or Google Play.
        <Link.Anchor
            href="https://appwrite.io/docs/products/auth/security#mock-phone-numbers"
            target="_blank"
            rel="noopener noreferrer">
            Learn more</Link.Anchor>
        <svelte:fragment slot="aside">
            {#if isComponentDisabled}
                <EmptyCardImageCloud source="email_signature_card" noAspectRatio>
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
                        <div class="is-not-mobile u-width-full-line u-height-100-percent">
                            {#if $app.themeInUse === 'dark'}
                                <img
                                    src={MockNumbersDark}
                                    width="266"
                                    height="171"
                                    class="u-image-object-fit-contain u-block u-only-dark u-width-full-line u-height-100-percent"
                                    style:object-position="top"
                                    alt="Mock Numbers Example" />
                            {:else}
                                <img
                                    src={MockNumbersLight}
                                    width="266"
                                    height="171"
                                    class="u-image-object-fit-contain u-only-light u-width-full-line u-height-100-percent"
                                    style:object-position="top"
                                    alt="Mock Numbers Example" />
                            {/if}
                        </div>
                    </svelte:fragment>
                    <svelte:fragment slot="title">{emptyStateTitle}</svelte:fragment>
                    {emptyStateDescription}
                    <svelte:fragment let:source slot="cta">
                        <Button
                            secondary
                            fullWidth
                            external={isSelfHosted}
                            href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}
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
                        <InputPhone
                            id={`key-${index}`}
                            bind:value={number.phone}
                            placeholder="Enter phone number"
                            label={index === 0 ? 'Phone number' : undefined}
                            minlength={9}
                            maxlength={16}
                            required>
                            <Tooltip slot="end">
                                <Input.Action
                                    icon={IconRefresh}
                                    on:click={() => (number.phone = generateNumber())} />
                                <span slot="tooltip">Regenerate</span>
                            </Tooltip>
                        </InputPhone>
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
                            <Button
                                icon
                                compact
                                disabled={numbers.length === 0}
                                on:click={() => {
                                    deletePhoneNumber(index);
                                }}>
                                <span class="icon-x" aria-hidden="true" />
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
                                    phone: generateNumber(),
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
                            phone: generateNumber(),
                            otp: generateOTP()
                        });
                    }}>Generate number</Empty>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isSubmitDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
