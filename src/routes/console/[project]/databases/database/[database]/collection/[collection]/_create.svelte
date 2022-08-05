<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { Steps, Alert, InnerModal } from '$lib/components';
    import { Form, Button, InputTags, InputText } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { attributeList } from './store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Attribute from './document/[document]/_attribute.svelte';
    import { addNotification } from '$lib/stores/notifications';

    $: attributeList.load($page.params.collection);

    export let showCreate = false;

    let newDocument = {};
    let read: string[];
    let write: string[];
    let id: string;
    let showCustomId = false;
    let steps = [{ text: 'Create data' }, { text: 'Set permissions' }];
    let currentStep = 0;

    onMount(async () => {
        await attributeList.load($page.params.collection);
        initializeDocument();
    });

    const initializeDocument = () => {
        $attributeList.attributes.forEach((attr) => {
            if (attr.array) {
                newDocument[attr.key] = [null];
            } else {
                newDocument[attr.key] = null;
            }
        });
    };

    const create = async () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
        } else {
            try {
                await sdkForProject.databases.createDocument(
                    $page.params.collection,
                    id ?? 'unique()',
                    newDocument,
                    read,
                    write
                );
                addNotification({
                    message: 'Document has been created',
                    type: 'success'
                });
                showCreate = false;
            } catch (error) {
                addNotification({
                    message: error.message,
                    type: 'error'
                });
            }
        }
    };

    $: if (!showCreate) {
        initializeDocument();
        currentStep = 0;
        read = write = [];
    }
</script>

<Wizard title="Create document" bind:show={showCreate}>
    <svelte:fragment slot="aside">
        <Steps {steps} bind:currentStep />
    </svelte:fragment>
    <Form on:submit={create}>
        {#if currentStep === 0}
            <header class="form-header">
                <h1 class="heading-level-6">Create document data</h1>
                <p>Provide document data based on attributes you created earlier.</p>
            </header>
            <ul class="form-list">
                {#each $attributeList?.attributes?.filter((a) => a.status === 'available') as attribute}
                    {@const label = attribute.required ? `${attribute.key}*` : attribute.key}
                    {#if attribute.array}
                        {#each newDocument[attribute.key] as _v, index}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-${index}`}
                                        label={index === 0 ? label : ''}
                                        bind:value={newDocument[attribute.key][index]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        disabled={index === 0}
                                        on:click={() => {
                                            newDocument[attribute.key].splice(index, 1);
                                            newDocument = newDocument;
                                        }}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {:else}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-0`}
                                        {label}
                                        bind:value={newDocument[attribute.key][0]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button text disabled>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {/each}

                        <Button
                            text
                            disabled={newDocument[attribute.key][
                                newDocument[attribute.key].length - 1
                            ] === null}
                            on:click={() => {
                                {
                                    newDocument[attribute.key].push(null);
                                    newDocument = newDocument;
                                }
                            }}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text"> Add attribute</span>
                        </Button>
                    {:else}
                        <ul class="form-list">
                            <Attribute
                                {attribute}
                                id={attribute.key}
                                {label}
                                bind:value={newDocument[attribute.key]} />
                        </ul>
                    {/if}
                {/each}

                {#if !showCustomId}
                    <div>
                        <Pill button on:click={() => (showCustomId = !showCustomId)}
                            ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                                Document ID
                            </span></Pill>
                    </div>
                {:else}
                    <InnerModal bind:show={showCustomId}>
                        <svelte:fragment slot="title">User ID</svelte:fragment>
                        Enter a custom document ID. Leave blank for a randomly generated one.
                        <svelte:fragment slot="content">
                            <div class="form">
                                <InputText
                                    id="id"
                                    label="Custom ID"
                                    showLabel={false}
                                    placeholder="Enter ID"
                                    autofocus={true}
                                    bind:value={id} />

                                <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                                    <span
                                        class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                                        aria-hidden="true" />
                                    <span class="text u-line-height-1-5"
                                        >Allowed characters: alphanumeric, hyphen, non-leading
                                        underscore, period</span>
                                </div>
                            </div>
                        </svelte:fragment>
                    </InnerModal>
                {/if}
            </ul>
        {:else if currentStep === 1}
            <header class="form-header">
                <h1 class="heading-level-6">Set Permissions</h1>
                <p>
                    Assign read or write permissions at the <b> Collection Level</b> or
                    <b> Document Level</b>. If collection Level permissions are assigned,
                    permissions applied to individual documents are ignored.
                </p>
            </header>
            <Alert type="info">
                <svelte:fragment slot="title">
                    You have Collection Level permissions enabled
                </svelte:fragment>
                <p>
                    If you want to assign permissions specific to this document, you will need to
                    update your Collection Settings to enable Document Level permissions.
                </p>
            </Alert>

            <ul class="common-section">
                <InputTags
                    id="read"
                    label="Read Access"
                    placeholder="User ID, Team ID, or Role"
                    bind:tags={read} />
                <InputTags
                    id="write"
                    label="Write Access"
                    placeholder="User ID, Team ID, or Role"
                    bind:tags={write} />
            </ul>
        {/if}
        <div class="form-footer">
            <div class="u-flex u-main-end u-gap-12">
                {#if currentStep === 0}
                    <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
                    <Button submit>Next</Button>
                {:else if currentStep === steps.length - 1}
                    <Button secondary on:click={() => currentStep--}>Back</Button>
                    <Button submit>Create</Button>
                {:else}
                    <Button secondary on:click={() => currentStep--}>Back</Button>
                    <Button submit>Next</Button>
                {/if}
            </div>
        </div>
    </Form>
</Wizard>
