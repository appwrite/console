<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import { Alert, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import AttributeForm from '../document-[document]/attributeForm.svelte';
    import { Permissions } from '$lib/components/permissions';
    import type { PageData } from './$types';
    import type { Attributes } from '../store';
    import { ID } from '@appwrite.io/console';

    export let data: PageData;

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    type CreateDocument = {
        id?: string;
        document: object;
        permissions: string[];
        attributes: Attributes[];
    };

    function createDocumentWritable() {
        const availableAttributes = (data.collection.attributes as unknown as Attributes[]).filter(
            (a) => a.status === 'available'
        );
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
            const { $id } = await sdk
                .forProject(page.params.region, page.params.project)
                .databases.createDocument(
                    page.params.database,
                    page.params.collection,
                    $createDocument.id ?? ID.unique(),
                    $createDocument.document,
                    $createDocument.permissions
                );

            addNotification({
                message: 'Document has been created',
                type: 'success'
            });
            trackEvent(Submit.DocumentCreate, {
                customId: !!$createDocument.id
            });
            goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/document-${$id}`
            );
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DocumentCreate);
        }
    }
</script>

<Wizard
    title="Create document"
    href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/`}
    bind:showExitModal
    column
    columnSize="s"
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Data">
                <AttributeForm
                    bind:formValues={$createDocument.document}
                    attributes={$createDocument.attributes}
                    bind:customId={$createDocument.id} />
            </Fieldset>

            <Fieldset legend="Permissions">
                <Layout.Stack gap="xl">
                    <Typography.Text>
                        Choose which permission scopes to grant your application. It is best
                        practice to allow only the permissions you need to meet your project goals.
                    </Typography.Text>
                    {#if data.collection.documentSecurity}
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
                            and enable document security. Otherwise, only collection permissions will
                            be used.
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
