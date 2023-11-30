<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { message } from './store';
    import SMSPhone from '../smsPhone.svelte';
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
        <Heading tag="h6" size="7">Preview</Heading>
        <SMSPhone content={$message.data.content} />
    </div>
    <svelte:fragment slot="aside">
        <FormList>
            <InputTextarea
                id="message"
                label="Message"
                disabled={true}
                bind:value={$message.data.content}>
            </InputTextarea>
        </FormList>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <!-- TODO: Add support for editing draft messages -->
        <!-- <Button disabled={$message.status !== 'draft'} on:click={() => console.log('click')}
            >Edit message</Button> -->
    </svelte:fragment>
</CardGrid>
