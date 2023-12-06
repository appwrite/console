<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { FormList, InputText, InputTextarea } from '$lib/elements/forms';
    import { message } from './store';
    import PushPhone from '../pushPhone.svelte';
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
        <Heading tag="h6" size="7">Preview</Heading>
        <div class="u-flex u-main-center u-margin-block-start-24 u-width-full-line">
            <PushPhone title={$message.data.title} body={$message.data.body} />
        </div>
    </div>
    <svelte:fragment slot="aside">
        <FormList>
            <InputText id="title" label="Title" disabled={true} bind:value={$message.data.title}>
            </InputText>
            <InputTextarea
                id="message"
                label="Message"
                disabled={true}
                bind:value={$message.data.body}>
            </InputTextarea>
        </FormList>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <!-- TODO: Add support for editing draft messages -->
        <!-- <Button disabled={$message.status !== 'draft'} on:click={() => console.log('click')}
            >Edit message</Button> -->
    </svelte:fragment>
</CardGrid>
