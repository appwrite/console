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
    import { removeFile } from '$lib/helpers/files';
    import type { VariablesOperationItem } from './variablesOperation';

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
    export let onStatusChange: (detail: VariablesOperationItem) => void = () => {};

    let files: FileList;
    let secret = false;
    let error: string;
    let isSubmitting = false;
    $: filesList = files?.length
        ? Array.from(files).map((file) => ({
              ...file,
              name: file.name,
              size: file.size,
              extension: file.type,
              removable: true
          }))
        : [];

    async function handleSubmit() {
        let importId = '';
        let uploadCount = 0;

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

            const filteredEntries = entries.filter(([, value]) => !!value);

            if (!filteredEntries.length) {
                throw new Error('No variables found');
            }

            if (filteredEntries.length > 100) {
                throw new Error('Please upload a file with fewer than 100 environment variables.');
            }

            importId = crypto.randomUUID();
            uploadCount = filteredEntries.length;
            isSubmitting = true;

            onStatusChange({
                id: importId,
                count: uploadCount,
                mode: 'import',
                status: 'uploading'
            });

            show = false;

            await Promise.all(
                filteredEntries.map(([key, value]) => {
                    const found = variableList.variables.find((variable) => variable.key === key);
                    return found
                        ? sdkUpdateVariable(found.$id, key, value, secret)
                        : sdkCreateVariable(key, value, secret);
                })
            );

            onStatusChange({
                id: importId,
                count: uploadCount,
                mode: 'import',
                status: 'completed'
            });

            addNotification({
                type: 'success',
                message: `Variables have been uploaded.`
            });
        } catch (e) {
            error = e.message;

            if (importId) {
                onStatusChange({
                    id: importId,
                    count: uploadCount,
                    mode: 'import',
                    status: 'failed',
                    error
                });
            }

            if (!show) {
                addNotification({
                    type: 'error',
                    message: error
                });
            }
        } finally {
            isSubmitting = false;
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
                <Layout.Stack alignItems="center" justifyContent="center" inline>
                    <Typography.Text variant="l-500" align="center" inline>
                        Drag and drop a file here or click to upload
                        <Layout.Stack
                            style="display: inline-flex; vertical-align: middle;"
                            inline
                            alignItems="center"
                            justifyContent="center">
                            <Tooltip>
                                <Icon icon={IconInfo} size="s" />
                                <svelte:fragment slot="tooltip"
                                    >Only .env files allowed</svelte:fragment>
                            </Tooltip>
                        </Layout.Stack>
                    </Typography.Text>
                </Layout.Stack>
                <Typography.Caption variant="400" align="center">
                    Up to 100 variables allowed
                </Typography.Caption>
            </Layout.Stack>
        </Layout.Stack>
    </Upload.Dropzone>
    {#if files?.length}
        <Upload.List
            bind:files={filesList}
            on:remove={(e) => (files = removeFile(e.detail, files))} />
    {/if}

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
        <Button text on:click={() => (show = false)} disabled={isSubmitting}>Cancel</Button>
        <Button submit disabled={!files?.length || isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Import'}
        </Button>
    </svelte:fragment>
</Modal>
