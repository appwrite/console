<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { type Writable, writable } from 'svelte/store';
    import AttributeForm from './document-[document]/attributeForm.svelte';
    import { Permissions } from '$lib/components/permissions';
    import type { Attributes } from './store';
    import { ID, type Models } from '@appwrite.io/console';
    import { Alert, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import SideSheet from './layout/sidesheet.svelte';

    let {
        collection,
        showSheet = $bindable(false),
        existingData = $bindable(null)
    }: {
        showSheet: boolean;
        collection: Models.Collection;
        existingData: Models.Document | null;
    } = $props();

    let isSubmitting = $state(false);

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
                if (existingData && existingData[attr.key]) {
                    acc[attr.key] = attr.array
                        ? Array.isArray(existingData[attr.key])
                            ? [...existingData[attr.key]]
                            : []
                        : existingData[attr.key];
                } else {
                    acc[attr.key] = attr.array ? [] : null;
                }
                return acc;
            }, {}),
            permissions: [],
            attributes: availableAttributes
        };

        return writable<CreateDocument>({ ...initial });
    }

    let createDocument: Writable<CreateDocument> = $state<Writable<CreateDocument> | null>(null);

    $effect(() => {
        if (showSheet) {
            createDocument = createDocumentWritable();
        }
    });

    async function create() {
        isSubmitting = true;

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

            // post op clear.
            existingData = null;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DocumentCreate);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="sheet-container">
    <!-- TODO: add a ID badge-->
    <SideSheet
        spaced
        title={`${existingData ? 'Duplicate' : 'Create'} record`}
        bind:show={showSheet}
        closeOnBlur={false}
        submit={{
            text: 'Create',
            disabled: isSubmitting,
            onClick: () => create()
        }}>
        <Layout.Stack gap="xxl">
            <AttributeForm
                bind:formValues={$createDocument.document}
                attributes={$createDocument.attributes}
                bind:customId={$createDocument.id} />

            <Layout.Stack gap="xl">
                <Typography.Text>
                    Choose which permission scopes to grant your application. It is best practice to
                    allow only the permissions you need to meet your project goals.
                </Typography.Text>
                {#if collection.documentSecurity}
                    <Alert.Inline status="info">
                        <svelte:fragment slot="title">Document security is enabled</svelte:fragment>
                        Users will be able to access this document if they have been granted
                        <b>either document or collection permissions</b>.
                    </Alert.Inline>
                    <Permissions bind:permissions={$createDocument.permissions} />
                {:else}
                    <Alert.Inline status="info">
                        <svelte:fragment slot="title"
                            >Document security is disabled</svelte:fragment>
                        If you want to assign document permissions, navigate to Collection settings and
                        enable document security. Otherwise, only collection permissions will be used.
                    </Alert.Inline>
                {/if}
            </Layout.Stack>
        </Layout.Stack>
    </SideSheet>
</div>
