<script lang="ts">
    import { page } from '$app/stores';
    import { Button, Form, FormList, InputTextarea } from '$lib/elements/forms';
    import { saveSmsTemplate } from './+page.svelte';
    import { smsTemplate } from './strote';

    const projectId = $page.params.project;
    let openResetModal = false;

    function submit() {
        saveSmsTemplate(projectId, $smsTemplate);
    }
</script>

<Form onSubmit={submit}>
    <FormList>
        <InputTextarea bind:value={$smsTemplate.message} id="message" label="Message" />
    </FormList>
    <div class="u-flex u-gap-32 u-main-end">
        <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
        <Button submit>Update</Button>
    </div>
</Form>
