<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading, Alert } from '$lib/components';
    import { FormList, InputPhone, InputText } from '$lib/elements/forms';
    import Output from '$lib/components/output.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import Table from '$lib/elements/table/table.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import type { MockNumber } from '$lib/sdk/auth';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';

    let projectId: string = $project.$id;
    let numbers = writable<MockNumber[]>($project.authMockNumbers);

    let isMockNumbersDisabled = true;
    let phoneNumber: string = null;
    let otp: string = null;

    onMount(async () => {
        console.log($numbers)
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

    // const addPhoneNumber = () => {
    //     numbers.update((n) => [
    //         ...n,
    //         {
    //             phone: phoneNumber,
    //             otp: otp
    //         }
    //     ]);
    //     phoneNumber = null;
    //     otp = null;
    // };

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
        Create upto 10 mock phone numbers and verification codes for testing. These numbers
        can be used to simulate the phone number verification without sending an SMS.
    </p>

    <svelte:fragment slot="aside">
        <Alert dismissible={false} type="info">
            <svelte:fragment slot="title">Use Mock phone numbers with caution</svelte:fragment>
            Please use fictious phone numbers and verification codes to avoid affecting real user accounts.
        </Alert>

        <FormList>
            <ul class="form-list is-multiple">
                <InputPhone
                    id="phone-number"
                    label="Phone Number"
                    placeholder="+1 650-555-1234"
                    autocomplete={false}
                    bind:value={phoneNumber} />

                <InputText
                    id="otp"
                    label="Verification Code"
                    bind:value={otp}
                    maxlength={6}
                    placeholder="123456" />
            </ul>
        </FormList>

        {#if $numbers.length > 0}
            <Table noMargin noStyles>
                <TableHeader>
                    <TableCellHead width={180}>Phone Number</TableCellHead>
                    <TableCellHead width={180}>Verification Code</TableCellHead>
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each $numbers as number, i}
                        <TableRow>
                            <TableCell title="Phone">
                                <Output value={number.phone} hideCopyIcon>
                                    {number.phone}
                                </Output>
                            </TableCell>

                            <TableCell showOverflow title="Verification Code">
                                <Output value={number.otp.toString()} hideCopyIcon>
                                    {number.otp}
                                </Output>
                            </TableCell>

                            <TableCell title="Remove" width={40}>
                                <div class="u-flex">
                                    <button
                                        class="button is-text is-only-icon"
                                        type="button"
                                        aria-label="delete"
                                        on:click={() => deletePhoneNumber(number)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={isMockNumbersDisabled} on:click={updateMockNumbers}>Update</Button>
    </svelte:fragment>
</CardGrid>
