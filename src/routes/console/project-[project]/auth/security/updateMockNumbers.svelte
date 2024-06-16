<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { FormList, InputPhone, InputText } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
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

    let projectId: string = $project.$id;
    let numbers = writable<MockNumber[]>([]);

    let isMockNumbersDisabled = true;
    let phoneNumber: string = null;
    let otp: string = null;

    onMount(async () => {
        console.log('Project', $project);
        console.log('Numbers', $numbers);
    });

    async function updateMockNumbers() {
        numbers.update((n) => [
            ...n,
            {
                phone: phoneNumber,
                otp: otp
            }
        ]);
        phoneNumber = null;
        otp = null;

        console.log($numbers);
        // try {
        //     await sdk.forConsole.auth.updateMockNumbers(projectId, $numbers);
        //     await invalidate(Dependencies.PROJECT);
        //     addNotification({
        //         type: 'success',
        //         message: 'Updated mock phone numbers successfully'
        //     });
        //     trackEvent(Submit.AuthMockNumbersUpdate);
        // } catch (error) {
        //     addNotification({
        //         type: 'error',
        //         message: error.message
        //     });
        //     trackError(error, Submit.AuthMockNumbersUpdate);
        // }
    }

    const addPhoneNumber = (number: MockNumber) => {
        numbers.update((n) => [
            ...n,
            {
                phone: number.phone,
                otp: number.otp
            }
        ]);
        phoneNumber = null;
        otp = null;
    };

    const deletePhoneNumber = (number: MockNumber) => {
        numbers.update((n) => n.filter((num) => num.phone !== number.phone));

        console.log($numbers);
    };

    $: if (numbers && symmetricDifference($numbers, $project.authMockNumbers).length) {
        isMockNumbersDisabled = false;
    } else isMockNumbersDisabled = true;

    $: if (phoneNumber && otp) {
        isMockNumbersDisabled = false;
    } else isMockNumbersDisabled = true;
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
                                required />
                            <InputText
                                id={`value-${index}`}
                                fullWidth
                                placeholder="Enter value"
                                label="Verification Code"
                                required />
                            <FormItemPart alignEnd>
                                <Button text>
                                    <span class="icon-x" aria-hidden="true" />
                                </Button>
                            </FormItemPart>
                        </FormItem>
                    {/each}
                </ul>
                <Button noMargin text>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add preference</span>
                </Button>
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
        <Button disabled={false} on:click={updateMockNumbers}>Update</Button>
    </svelte:fragment>
</CardGrid>
