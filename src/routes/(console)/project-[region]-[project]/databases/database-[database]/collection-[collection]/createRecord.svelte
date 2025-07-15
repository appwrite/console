<script lang="ts">
    import { page } from '$app/state';
    import Form from '$lib/elements/forms/form.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import AttributeForm from './document-[document]/attributeForm.svelte';
    import { Permissions } from '$lib/components/permissions';
    import type { Attributes } from './store';
    import { ID, type Models } from '@appwrite.io/console';
    import { Alert, Divider, Layout, Sheet, Typography } from '@appwrite.io/pink-svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let showSheet = false;
    export let collection: Models.Collection;

    let formComponent: Form;
    let isSubmitting = writable(false);

    type CreateDocument = {
        id?: string;
        document: object;
        permissions: string[];
        attributes: Attributes[];
    };

    function createDocumentWritable() {
        const availableAttributes = collection.attributes.filter((a) => a.status === 'available');
        const initial = {
            id: null,
            document: availableAttributes.reduce((acc, attr) => {
                acc[attr.key] = attr.array ? [] : null;

                return acc;
            }, {}),
            permissions: [],
            attributes: availableAttributes
        };

        const store = writable<CreateDocument>({ ...initial });

        return store;
    }

    const createDocument = createDocumentWritable();

    async function create() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.createDocument(
                    page.params.database,
                    page.params.collection,
                    $createDocument.id ?? ID.unique(),
                    $createDocument.document,
                    $createDocument.permissions
                );

            showSheet = false;
            addNotification({
                message: 'Document has been created',
                type: 'success'
            });
            invalidate(Dependencies.DOCUMENTS);
            trackEvent(Submit.DocumentCreate, {
                customId: !!$createDocument.id
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DocumentCreate);
        }
    }
</script>

<div class="sheet-container">
    <Sheet bind:open={showSheet} closeOnBlur={false}>
        <svelte:fragment slot="header">
            <Layout.Stack>
                Create document

                <!-- TODO: add a ID badge-->
            </Layout.Stack>
        </svelte:fragment>

        <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
            <Layout.Stack direction="column" justifyContent="space-evenly">
                <Layout.Stack gap="xxl">
                    <AttributeForm
                        bind:formValues={$createDocument.document}
                        attributes={$createDocument.attributes}
                        bind:customId={$createDocument.id} />

                    <Layout.Stack gap="xl">
                        <Typography.Text>
                            Choose which permission scopes to grant your application. It is best
                            practice to allow only the permissions you need to meet your project
                            goals.
                        </Typography.Text>
                        {#if collection.documentSecurity}
                            <Alert.Inline status="info">
                                <svelte:fragment slot="title"
                                    >Document security is enabled</svelte:fragment>
                                Users will be able to access this document if they have been granted
                                <b>either document or collection permissions</b>.
                            </Alert.Inline>
                            <Permissions bind:permissions={$createDocument.permissions} />
                        {:else}
                            <Alert.Inline status="info">
                                <svelte:fragment slot="title"
                                    >Document security is disabled</svelte:fragment>
                                If you want to assign document permissions, navigate to Collection settings
                                and enable document security. Otherwise, only collection permissions
                                will be used.
                            </Alert.Inline>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>

                <div class="sheet-footer">
                    <Layout.Stack gap="l">
                        <Divider />

                        <div class="sheet-footer-actions">
                            <Layout.Stack gap="m" direction="row" justifyContent="flex-end">
                                <Button
                                    size="s"
                                    secondary
                                    fullWidthMobile
                                    on:click={() => (showSheet = false)}>Cancel</Button>

                                <Button
                                    size="s"
                                    fullWidthMobile
                                    disabled={$isSubmitting}
                                    on:click={() => formComponent.triggerSubmit()}>
                                    Create
                                </Button>
                            </Layout.Stack>
                        </div>
                    </Layout.Stack>
                </div>
            </Layout.Stack>
        </Form>
    </Sheet>
</div>

<style>
    .sheet-container {
        top: 0;
        position: absolute;

        & :global(aside header) {
            @media (max-width: 768px) {
                margin-top: 6rem;
            }
        }
    }

    .sheet-footer {
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;

        & .sheet-footer-actions {
            padding: var(--space-8);
        }
    }
</style>
