<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { InputPhone, InputText } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import type { MockNumber } from '$lib/sdk/auth';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import Empty from '$lib/components/empty.svelte';
    import FormItem from '$lib/elements/forms/formItem.svelte';
    import FormItemPart from '$lib/elements/forms/formItemPart.svelte';

    let numbers = writable<MockNumber[]>($project.authMockNumbers);
    let initialNumbers = $project.authMockNumbers.map((num) => ({ ...num }));
    let projectId: string = $project.$id;
    let isMockNumbersDisabled = true;

    const onInputChanged = () => {
        isMockNumbersDisabled = JSON.stringify($numbers) === JSON.stringify(initialNumbers);
    };

    async function updateMockNumbers() {
        try {
            await sdk.forConsole.auth.updateMockNumbers(projectId, $numbers);
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

    const addPhoneNumber = (number?: MockNumber) => {
        numbers.update((n) => [
            ...n,
            {
                phone: number?.phone,
                otp: number?.otp
            }
        ]);
    };

    const deletePhoneNumber = (index: number) => {
        numbers.update((n) => {
            n.splice(index, 1);
            return n;
        });
    };
</script>

<CardGrid>
    <Heading tag="h6" size="7" id="variables">Mock Phone Numbers</Heading>
    <p>
        Generate <b>fictional</b> numbers to simulate phone verification while testing demo accounts.
        A maximum of 10 phone numbers can be generated.
    </p>

    <svelte:fragment slot="aside">
        {#if $numbers.length > 0}
            <form class="form u-grid u-gap-16">
                <ul class="form-list">
                    {#each $numbers as number, index}
                        <FormItem isMultiple>
                            <InputPhone
                                id={`key-${index}`}
                                bind:value={number.phone}
                                fullWidth
                                placeholder="Enter Phone Number"
                                label="Phone Number"
                                showLabel={index === 0 ? true : false}
                                on:input={onInputChanged}
                                required />
                            <InputText
                                id={`value-${index}`}
                                bind:value={number.otp}
                                fullWidth
                                placeholder="Enter value"
                                label="Verification Code"
                                showLabel={index === 0 ? true : false}
                                on:input={onInputChanged}
                                maxlength={6}
                                required />
                            <FormItemPart alignEnd>
                                <Button
                                    text
                                    disabled={$numbers.length === 1}
                                    on:click={() => {
                                        deletePhoneNumber(index);
                                    }}>
                                    <span class="icon-x" aria-hidden="true" />
                                </Button>
                            </FormItemPart>
                        </FormItem>
                    {/each}
                </ul>
                {#if $numbers.length < 10}
                    <Button
                        noMargin
                        text
                        on:click={() => addPhoneNumber()}
                        disabled={$numbers.length >= 10}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Add number</span>
                    </Button>
                {/if}
            </form>
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
        <Button disabled={isMockNumbersDisabled} on:click={updateMockNumbers}>Update</Button>
    </svelte:fragment>
</CardGrid>
