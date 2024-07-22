<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { InputPhone, InputText } from '$lib/elements/forms';
    import { Button, Form, FormItem, FormItemPart } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import MockNumbersLight from './mock-numbers-light.png';
    import MockNumbersDark from './mock-numbers-dark.png';
    import EmptyCardImageCloud from '$lib/components/emptyCardImageCloud.svelte';
    import { app } from '$lib/stores/app';
    import Empty from '$lib/components/empty.svelte';
    import type { Models } from '@appwrite.io/console';

    let numbers: Models.MockNumber[] = $project?.authMockNumbers ?? [];
    let initialNumbers = [];
    let projectId: string = $project.$id;

    $: initialNumbers = $project?.authMockNumbers?.map((num) => ({ ...num })) ?? [];
    $: submitDisabled = JSON.stringify(numbers) === JSON.stringify(initialNumbers);

    async function updateMockNumbers() {
        try {
            await sdk.forConsole.projects.updateMockNumbers(projectId, numbers);
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated mock phone numbers successfully'
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
    <CardGrid>
        <Heading tag="h6" size="7" id="variables">Mock Phone Numbers</Heading>
        <p>
            Generate <b>fictional</b> numbers to simulate phone verification when testing demo accounts
            for submitting your application to the App Store or Google Play. Learn more
        </p>
        <svelte:fragment slot="aside">
            {#if isCloud && $organization?.billingPlan === BillingPlan.FREE}
                <EmptyCardImageCloud source="email_signature_card" let:nextTier noAspectRatio>
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
                    <svelte:fragment slot="title"
                        >Upgrade to add mock phone numbers</svelte:fragment>
                    Upgrade to a {nextTier} to add mock phone numbers to your project.
                </EmptyCardImageCloud>
            {:else if numbers?.length > 0}
                <ul class="form-list">
                    {#each numbers as number, index}
                        <FormItem isMultiple>
                            <InputPhone
                                id={`key-${index}`}
                                bind:value={number.phone}
                                fullWidth
                                placeholder="Enter Phone Number"
                                label="Phone Number"
                                showLabel={index === 0 ? true : false}
                                minlength={8}
                                maxlength={16}
                                required>
                                <div class="options-list">
                                    <button
                                        on:click={() => (number.phone = generateNumber())}
                                        class="options-list-button"
                                        aria-label="regenerate text"
                                        type="button">
                                        <span class="icon-refresh" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </InputPhone>
                            <InputText
                                id={`value-${index}`}
                                bind:value={number.otp}
                                fullWidth
                                placeholder="Enter value"
                                label="Verification Code"
                                pattern="\d*"
                                showLabel={index === 0 ? true : false}
                                maxlength={6}
                                required />
                            <FormItemPart alignEnd>
                                <Button
                                    text
                                    disabled={numbers.length === 0}
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
            <Button disabled={submitDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
