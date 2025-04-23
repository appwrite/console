<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import {
        Alert,
        Fieldset,
        Icon,
        Layout,
        Tag,
        Typography,
        Upload
    } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { writable } from 'svelte/store';
    import { Permissions } from '$lib/components/permissions';
    import type { PageData } from './$types';
    import { isCloud } from '$lib/system';
    import { currentPlan } from '$lib/stores/organization';
    import { humanFileSize, sizeToBytes } from '$lib/helpers/sizeConvertion';
    import CustomId from '$lib/components/customId.svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { ID } from '@appwrite.io/console';
    import { uploader } from '$lib/stores/uploader';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { removeFile } from '$lib/helpers/files';

    export let data: PageData;

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);
    let fileError: string = null;
    let showCustomId = false;
    const service = $currentPlan?.['fileSize'];
    let files: FileList | null = null;
    let id: string | null = null;
    let permissions: string[] = [];

    async function create() {
        const fileId = id ?? ID.unique();

        try {
            const promise = uploader.uploadFile(page.params.bucket, fileId, files[0], permissions);
            await goto(
                `${base}/project-${page.params.project}/storage/bucket-${page.params.bucket}`
            );
            addNotification({
                type: 'success',
                message: `File upload in progress`
            });
            trackEvent(Submit.FileCreate, {
                customId: !!id
            });
            await promise;
            invalidate(Dependencies.FILES);
        } catch (e) {
            uploader.removeFromQueue(fileId);
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.FileCreate);
        }
    }
</script>

<Wizard
    title="Create file"
    href={`${base}/project-${page.params.project}/storage/bucket-${page.params.bucket}/`}
    bind:showExitModal
    column
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Data">
                <Layout.Stack>
                    {#if isCloud && fileError === 'File size exceeds the limit'}
                        {@const size = humanFileSize(
                            data.bucket.maximumFileSize ?? sizeToBytes(service, 'MB', 1000)
                        )}
                        <Alert.Inline status="info">
                            The maximum file upload size for this bucket is {parseInt(
                                size.value
                            )}{size.unit}. You can adjust it in your
                            <a
                                href={`${base}/project-${page.params.project}/storage/bucket-${page.params.bucket}/settings`}
                                style:text-decoration="underline">bucket settings</a
                            >.
                        </Alert.Inline>
                    {/if}
                    <Upload.Dropzone
                        bind:files
                        required
                        extensions={data.bucket.allowedFileExtensions}>
                        <Typography.Text variant="l-500"
                            >Drag and drop files here or click to upload</Typography.Text>
                    </Upload.Dropzone>
                    {#if files}
                        <Upload.List
                            files={Array.from(files).map((b) => {
                                return {
                                    name: b.name,
                                    size: b.size,
                                    extension: b.type,
                                    removable: true
                                };
                            })}
                            on:remove={(e) => (files = removeFile(e.detail, files))} />
                    {/if}

                    {#if !showCustomId}
                        <div>
                            <Tag on:click={() => (showCustomId = !showCustomId)}>
                                <Icon icon={IconPencil} slot="start" />
                                <span class="text"> File ID </span>
                            </Tag>
                        </div>
                    {:else}
                        <CustomId autofocus bind:show={showCustomId} name="File" bind:id />
                    {/if}
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Permissions">
                <Layout.Stack gap="xl">
                    <Typography.Text>
                        Choose who can access your buckets and files. For more information, check
                        out the
                        <a
                            href="https://appwrite.io/docs/advanced/platform/permissions"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="link">
                            Permissions Guide
                        </a>.
                    </Typography.Text>

                    {#if data.bucket.fileSecurity}
                        <Alert.Inline status="info" title="File security enabled">
                            Users will be able to access this file if they have been granted
                            <b>either File or Bucket permissions</b>.
                        </Alert.Inline>
                        <Permissions bind:permissions />
                    {:else}
                        <Alert.Inline status="info" title="File security disabled">
                            If you want to assign file permissions, navigate to Bucket settings and
                            enable file security. Otherwise, only Bucket permissions will be used.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create
        </Button>
    </svelte:fragment>
</Wizard>
