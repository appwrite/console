<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, FormList, InputTextarea } from '$lib/elements/forms';
    import { Table, TableCellHead, TableHeader } from '$lib/elements/table';

    export let show = false;
    export let message: string;
    export let data: unknown[];

    let error: string;

    function update() {
        console.log('test');
    }
</script>

<Modal {error} onSubmit={update} size="big" bind:show on:close>
    <svelte:fragment slot="header">Edit Message</svelte:fragment>
    <FormList>
        <InputTextarea
            bind:value={message}
            id="message"
            label="Message"
            placeholder="Enter your message" />
    </FormList>

    <Table noMargin noStyles>
        <TableHeader>
            <TableCellHead>Variables</TableCellHead>
            <TableCellHead width={180} />
        </TableHeader>
        <!-- <TableBody>
            {#each data?.variables as variable}
                <TableRow>
                    <TableCell title="variable">
                        <Output value={variable.key} hideCopyIcon>
                            {variable.key}
                        </Output>
                    </TableCell>
                    <TableCellText title="name">
                        {variable.name}
                    </TableCellText>
                </TableRow>
            {/each}
        </TableBody> -->
    </Table>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button disabled submit>Update</Button>
    </svelte:fragment>
</Modal>
