<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Code, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { InputTextarea, FormList, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let selectedFunction: Models.Function = null;

    let show = false;
    let data: string = null;
    let showJson = false;
    let submitting = false;

    const example = `{
    "firstName": "hello",
    "lastName": "world",
    "age": "old"
}`;

    $: if (selectedFunction && !show) {
        show = true;
    }

    const handleSubmit = async () => {
        submitting = true;
        try {
            await sdk.forProject.functions.createExecution(
                selectedFunction.$id,
                data?.length ? data : undefined,
                true
            );
            goto(
                `${base}/console/project-${$page.params.project}/functions/function-${selectedFunction.$id}/executions`
            );
            close();
            addNotification({
                type: 'success',
                message: `Function has been executed`
            });
            trackEvent(Submit.ExecutionCreate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ExecutionCreate);
        } finally {
            submitting = false;
        }
    };

    function close() {
        selectedFunction = null;
        show = false;
    }

    afterNavigate(close);
</script>

<Modal bind:show size="big" onSubmit={handleSubmit} on:close={close}>
    <svelte:fragment slot="header"
        >{$LL.console.project.forms.functions.title.executeFunction()}</svelte:fragment>
    <FormList>
        <InputTextarea
            bind:value={data}
            id="data"
            label={$LL.console.project.forms.functions.inputs.data.label()} />
        <InputChoice
            type="switchbox"
            id="json"
            label={$LL.console.project.forms.functions.inputs.json.label()}
            bind:value={showJson}>
            {$LL.console.project.forms.functions.texts.customDataExample()}</InputChoice>
        {#if showJson}
            <Code noMargin language="json" withLineNumbers code={example} />
        {/if}
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={close}>{$LL.console.project.button.cancel()}</Button>
        <Button disabled={submitting} submit
            >{$LL.console.project.button.submit.executeNow()}</Button>
    </svelte:fragment>
</Modal>
