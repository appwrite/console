<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputFile } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let show = false;

    const dispatch = createEventDispatcher();

    const functionId = $page.params.function;
    let files: FileList;

    const handleSubmit = async () => {
        if (files?.length) {
            const variables = await parseFile(files[0]);
            for (const variable of variables) {
                try {
                    await sdkForProject.functions.createVariable(
                        functionId,
                        variable.key,
                        variable.value
                    );
                    invalidate(Dependencies.VARIABLES);
                    addNotification({
                        type: 'success',
                        message: 'Variable uploaded'
                    });
                } catch (error) {
                    addNotification({
                        type: 'error',
                        message: error.message
                    });
                }
            }
            dispatch('uploaded', variables);
        } else {
            addNotification({
                type: 'error',
                message: 'No file uploaded'
            });
        }
    };

    async function parseFile(file: File) {
        if (file) {
            let variables = [];
            let text = await file.text();
            text.split('\n').forEach((line) => {
                const [key, value] = line.split('=');
                variables.push({ key, value });
            });
            return variables;
        }
    }
</script>

<Modal bind:show on:submit={handleSubmit}>
    <svelte:fragment slot="header">Upload Variables</svelte:fragment>
    <p>
        Upload multiple variables via a .env file that will be passed to your function at runtime.
    </p>

    <InputFile bind:files label="Attach a file" />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
