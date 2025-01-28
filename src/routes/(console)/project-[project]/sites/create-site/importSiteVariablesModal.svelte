<script lang="ts">
    import { Modal } from '$lib/components';
    import Alert from '$lib/components/alert.svelte';
    import { Button, InputChoice, InputFile } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { parse } from 'envfile';

    export let show = false;
    export let variables: Partial<Models.Variable>[];

    let files: FileList;
    let error: string;
    let secret = false;

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

            entries
                .filter(([, value]) => !!value)
                .forEach(([key, value]) => {
                    variables.push({ key, value, secret });
                });

            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal title="Import variables" bind:show onSubmit={handleSubmit} bind:error>
    <span slot="description"> Import new environment variables from .env file. </span>
    <InputFile bind:files />
    {#if variables?.length > 0}
        <Alert type="info" dismissible>
            This action can create and update variables but can not delete them.
        </Alert>
    {/if}

    <InputChoice id="secret" label="Secret" bind:value={secret}>
        If selected, you and your team won't be able to read the values after creation.</InputChoice>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!files?.length}>Import</Button>
    </svelte:fragment>
</Modal>
