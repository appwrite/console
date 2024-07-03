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

    $: console.log(numbers, initialNumbers);
</script>

<Form onSubmit={updateMockNumbers}>
    <CardGrid>
        <Heading tag="h6" size="7" id="variables">Mock Phone Numbers</Heading>
        <p>
            Generate <b>fictional</b> numbers to simulate phone verification while testing demo accounts.
            A maximum of 10 phone numbers can be generated.
        </p>

        <svelte:fragment slot="aside">
            {#if numbers?.length > 0}
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
                                required />
                            <InputText
                                id={`value-${index}`}
                                bind:value={number.otp}
                                fullWidth
                                placeholder="Enter value"
                                label="Verification Code"
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
                                phone: '',
                                otp: ''
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
                            phone: '',
                            otp: ''
                        });
                    }}>Create a mock phone number</Empty>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={submitDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
