<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputFile } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { parse } from 'dotenv';
    import { variables } from './store';
    import LL from '$i18n/i18n-svelte';

    export let show = false;

    const functionId = $page.params.function;

    let files: FileList;
    let error: string;

    async function handleSubmit() {
        try {
            if (!files?.length) {
                throw new Error('No file selected');
            }

            const uploaded = parse(await files[0].text());

            if (!Object.keys(uploaded).length) {
                throw new Error('No variables found');
            }

            const entries = Object.entries(uploaded);

            for (const [key, value] of entries) {
                if (value.length > 8192) {
                    throw new Error(`Variable ${key} is longer than 8192 allowed characters`);
                }
            }

            await Promise.all(
                entries
                    .filter(([, value]) => !!value)
                    .map(([key, value]) => {
                        const found = $variables.find((variable) => variable.key === key);
                        return found
                            ? sdk.forProject.functions.updateVariable(
                                  functionId,
                                  found.$id,
                                  key,
                                  value
                              )
                            : sdk.forProject.functions.createVariable(functionId, key, value);
                    })
            );

            await invalidate(Dependencies.VARIABLES);
            addNotification({
                type: 'success',
                message: 'Variables uploaded'
            });
            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal bind:show onSubmit={handleSubmit} bind:error>
    <svelte:fragment slot="header">{$LL.console.project.title.uploadVariables()}</svelte:fragment>
    <p>
        {$LL.console.project.texts.functions.uploadVariables()}
    </p>

    <InputFile bind:files />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>{$LL.console.project.button.cancel()}</Button>
        <Button submit>{$LL.console.project.button.submit.upload()}</Button>
    </svelte:fragment>
</Modal>
