<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { Code, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { InputTextarea, FormList, InputChoice } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import ExecuteHeaders from './executeHeaders.svelte';

    export let selectedFunction: Models.Function = null;

    let show = false;
    let body: string = null;
    let path: string = null;
    let method: string = null;
    let headers: [string, string][] = [['', '']];
    let submitting = false;

    $: if (selectedFunction && !show) {
        show = true;
    }

    const handleSubmit = async () => {
        submitting = true;

        try {
            const jsonHeaders: any = {};
            for (const [key, value] of headers) {
                jsonHeaders[key] = value;
            }
            console.log(jsonHeaders);

            await sdkForProject.functions.createExecution(
                selectedFunction.$id,
                body?.length ? body : undefined,
                true,
                path?.length ? path : undefined,
                method?.length ? method : undefined,
                Object.keys(jsonHeaders).length > 0 ? jsonHeaders : undefined
            );
            close();
            addNotification({
                type: 'success',
                message: `Function has been executed`
            });
            trackEvent('submit_execution_create');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
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

<Modal bind:show size="big" on:submit={handleSubmit} on:close={close}>
    <svelte:fragment slot="header">Execute Function</svelte:fragment>
    <FormList>
        <InputSelect
            options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'PATCH', label: 'PATCH' },
                { value: 'DELETE', label: 'DELETE' }
            ]}
            bind:value={method}
            id="method"
            label="Method (optional)" />
        <InputText bind:value={path} id="path" label="Path and query (optional)" />
        <InputTextarea bind:value={body} id="body" label="Body (optional)" />

        <div>
            <ExecuteHeaders bind:headers />
        </div>
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={close}>Cancel</Button>
        <Button disabled={submitting} submit>Execute Now</Button>
    </svelte:fragment>
</Modal>
