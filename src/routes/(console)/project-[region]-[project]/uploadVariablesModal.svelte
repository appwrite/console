<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import {
        Alert,
        Icon,
        InlineCode,
        Layout,
        Selector,
        Tooltip,
        Typography,
        Upload
    } from '@appwrite.io/pink-svelte';
    import { parse } from '$lib/helpers/envfile';

    export let show = false;
    export let variableList: Models.VariableList;
    export let sdkCreateVariable: (
        key: string,
        value: string,
        secret?: boolean
    ) => Promise<unknown>;
    export let sdkUpdateVariable: (
        variableId: string,
        key: string,
        value: string,
        secret?: boolean
    ) => Promise<unknown>;

    let files: FileList;
    let secret = false;
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
                            ? sdkUpdateVariable(found.$id, key, value, secret)
                            : sdkCreateVariable(key, value, secret);
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

<Modal title="Import variables" bind:show bind:error onSubmit={handleSubmit}>
    <span slot="description">
        Import new environment variables from <InlineCode code=".env" size="s" /> file.
    </span>

    <Upload.Dropzone bind:files>
        <Layout.Stack alignItems="center" gap="s">
            <Layout.Stack alignItems="center" gap="s">
                <Layout.Stack alignItems="center" justifyContent="center" direction="row" gap="s">
                    <Typography.Text variant="l-500">
                        Drag and drop files here or click to upload
                    </Typography.Text>
                    <Tooltip>
                        <Layout.Stack alignItems="center" justifyContent="center" inline>
                            <Icon icon={IconInfo} size="s" />
                        </Layout.Stack>
                        <svelte:fragment slot="tooltip">Only .env files allowed</svelte:fragment>
                    </Tooltip>
                </Layout.Stack>
                <Typography.Caption variant="400">Up to 100 variables allowed</Typography.Caption>
            </Layout.Stack>
        </Layout.Stack>
    </Upload.Dropzone>

    {#if variableList.total > 0}
        <Alert.Inline>
            This action can create and update variables but can not delete them.
        </Alert.Inline>
    {/if}

    <Selector.Checkbox
        size="s"
        id="secret"
        label="Secret"
        bind:checked={secret}
        description="If selected, you and your team won't be able to read the values after creation." />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!files?.length}>Import</Button>
    </svelte:fragment>
</Modal>
