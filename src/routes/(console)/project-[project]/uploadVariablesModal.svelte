<script lang="ts">
    import { Modal } from '$lib/components';
    import Alert from '$lib/components/alert.svelte';
    import { Button, InputFile } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { parse } from 'envfile';

    export let isGlobal: boolean;
    export let show = false;
    export let variableList: Models.VariableList;
    export let sdkCreateVariable: (key: string, value: string) => Promise<unknown>;
    export let sdkUpdateVariable: (
        variableId: string,
        key: string,
        value: string
    ) => Promise<unknown>;

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
                message: `Variables have been uploaded.`
            });

            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal headerDivider={false} bind:show onSubmit={handleSubmit} bind:error>
    <svelte:fragment slot="title">
        Import new {isGlobal ? 'global' : 'environment'} variables
    </svelte:fragment>
    <div class="u-flex u-flex-vertical u-gap-24 u-margin-block-start-8">
        <p>
            Import new {isGlobal ? 'global' : 'environment'} variables from
            <span class="inline-code">.env</span>
            file that will be passed to {isGlobal
                ? 'all functions within your project'
                : 'your function'}.
        </p>

        {#if variableList.total > 0}
            <Alert type="info">
                Existing {isGlobal ? 'global' : 'environment'} variables will be updated. They will not
                be deleted if they are not present in your .env file.
            </Alert>
        {/if}
    </div>

    <InputFile bind:files />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!files?.length}>Import</Button>
    </svelte:fragment>
</Modal>
