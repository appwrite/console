<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, FormList, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import SMSPhone from '../smsPhone.svelte';

    export let message: Models.Message & { data: Record<string, string>; };
    export let onEdit: () => void = null;
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
        <Heading tag="h6" size="7">Preview</Heading>
        <SMSPhone content={message.data.content} />
    </div>
    <svelte:fragment slot="aside">
        <FormList>
            <InputTextarea
                id="message"
                label="Message"
                disabled={true}
                bind:value={message.data.content}>
            </InputTextarea>
            <div class="u-flex u-main-end">
                <Button secondary disabled={onEdit == null} on:click={onEdit}>Edit message</Button>
            </div>
        </FormList>
    </svelte:fragment>
</CardGrid>
