<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputFile } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { parse } from 'dotenv';

    export let redeployMessage: string;
    export let show = false;
    export let variableList: Models.VariableList;
    export let sdkCreateVariable: (key: string, value: string) => Promise<any>;
    export let sdkUpdateVariable: (variableId: string, key: string, value: string) => Promise<any>;

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
                        const found = variableList.variables.find(
                            (variable) => variable.key === key
                        );
                        return found
                            ? sdkUpdateVariable(found.$id, key, value)
                            : sdkCreateVariable(key, value);
                    })
            );

            addNotification({
                type: 'success',
                message: `Variables have been uploaded. ${redeployMessage}`
            });

            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal headerDivider={false} bind:show onSubmit={handleSubmit} bind:error>
    <svelte:fragment slot="header">Upload Variables</svelte:fragment>
    <p>
        Upload multiple environment variables via a .env file that will be passed to your function.
    </p>

    <InputFile bind:files />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Upload</Button>
    </svelte:fragment>
</Modal>
