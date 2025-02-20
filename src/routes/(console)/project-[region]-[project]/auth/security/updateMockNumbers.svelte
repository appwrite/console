<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { InputPhone, InputOTP } from '$lib/elements/forms';
    import { Button, Form, FormItem, FormItemPart } from '$lib/elements/forms';
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
    import { tooltip } from '$lib/actions/tooltip';

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
        <Heading tag="h6" size="7" id="variables">Mock phone numbers</Heading>
        <p>
            Generate <b>fictional</b> numbers to simulate phone verification when testing demo
            accounts for submitting your application to the App Store or Google Play.
            <a
                href="https://appwrite.io/docs/products/auth/security#mock-phone-numbers"
                target="_blank"
                class="u-underline"
                rel="noopener noreferrer">
                Learn more</a>
        </p>
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
                            class="u-margin-block-start-32"
                            secondary
                            fullWidth
                            external={isSelfHosted}
                            href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}
                            on:click={() => {
                                trackEvent('click_cloud_signup', {
                                    from: 'button',
                                    source
                                });
                            }}>{cta}</Button>
                    </svelte:fragment>
                </EmptyCardImageCloud>
            {:else if numbers?.length > 0}
                <ul class="form-list u-gap-8">
                    {#each numbers as number, index}
                        <FormItem isMultiple>
                            <InputPhone
                                id={`key-${index}`}
                                bind:value={number.phone}
                                fullWidth
                                placeholder="Enter phone number"
                                label="Phone number"
                                showLabel={index === 0}
                                minlength={9}
                                maxlength={16}
                                required>
                                <button
                                    slot="options"
                                    use:tooltip={{ content: 'Regenerate', placement: 'bottom' }}
                                    on:click={() => (number.phone = generateNumber())}
                                    class="options-list-button"
                                    aria-label="regenerate text"
                                    type="button">
                                    <span class="icon-refresh" aria-hidden="true"></span>
                                </button>
                            </InputPhone>
                            <InputOTP
                                id={`value-${index}`}
                                bind:value={number.otp}
                                fullWidth
                                placeholder="Enter value"
                                label="Verification code"
                                maxlength={6}
                                pattern={'^[0-9]{6}$'}
                                patternError="The value must contain 6 digits"
                                showLabel={index === 0}
                                required>
                                <button
                                    slot="options"
                                    use:tooltip={{ content: 'Regenerate', placement: 'bottom' }}
                                    on:click={() => (number.otp = generateOTP())}
                                    class="options-list-button"
                                    aria-label="regenerate text"
                                    type="button">
                                    <span class="icon-refresh" aria-hidden="true"></span>
                                </button>
                            </InputOTP>
                            <FormItemPart>
                                <Button
                                    text
                                    disabled={numbers.length === 0}
                                    class={'u-padding-4 ' +
                                        (index === 0 ? 'u-margin-block-start-24' : '')}
                                    on:click={() => {
                                        deletePhoneNumber(index);
                                    }}>
                                    <span class="icon-x" aria-hidden="true" />
                                </Button>
                            </FormItemPart>
                        </FormItem>
                    {/each}
                </ul>
                {#if numbers?.length < 10}
                    <Button
                        noMargin
                        text
                        on:click={() =>
                            addPhoneNumber({
                                phone: generateNumber(),
                                otp: generateOTP()
                            })}
                        disabled={numbers.length >= 10}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Add number</span>
                    </Button>
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
