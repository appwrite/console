<script lang="ts">
    import { page } from '$app/stores';
    import { Button, Form, FormList, InputTextarea } from '$lib/elements/forms';
    import ResetSms from './resetSms.svelte';
    import { baseSmsTemplate, smsTemplate } from './strote';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { deepEqual } from '$lib/helpers/object';

    const projectId = $page.params.project;
    let openResetModal = false;

    async function saveSmsTemplate() {
        if (!$smsTemplate.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }
        try {
            await sdk.forConsole.projects.updateSmsTemplate(
                projectId,
                $smsTemplate.type,
                $smsTemplate.locale,
                $smsTemplate.message
            );
            addNotification({
                type: 'success',
                message: `SMS ${$smsTemplate.type} template for ${$smsTemplate.locale} updated`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    $: isButtonDisabled = deepEqual($smsTemplate, $baseSmsTemplate);
</script>

<div class="box">
    <Form onSubmit={saveSmsTemplate}>
        <FormList gap={8}>
            <InputTextarea
                bind:value={$smsTemplate.message}
                id="message"
                label="Message"
                placeholder="Enter your message" />
        </FormList>

        <div class="u-sep-block-start u-margin-block-start-24" />

        <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
            <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
            <Button submit disabled={isButtonDisabled}>Update</Button>
        </div>
    </Form>
</div>
<ResetSms bind:show={openResetModal} />
