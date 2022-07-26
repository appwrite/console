<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { Step, Steps } from '$lib/components';
    import {
        Form,
        FormList,
        InputCheckbox,
        InputText,
        InputEmail,
        InputNumber,
        InputSelect,
        Button
    } from '$lib/elements/forms';
    import { attributeList, type Attributes } from './store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    $: attributeList.load($page.params.collection);

    export let showCreate = false;

    let steps = [
        { title: 'Create data', current: true, completed: false },
        { title: 'Set permissions', current: false, completed: false }
    ];
    let currentStep = 0;
    let newDocument = {};
    let read: string[];
    let write: string[];

    onMount(async () => {
        console.log($attributeList);
        await attributeList.load($page.params.collection);
        $attributeList.attributes.forEach((attr) => {
            newDocument[attr.key] = attr.default;
        });
    });

    const create = async () => {
        console.log(newDocument);
        // await sdkForProject.databases.createDocument(
        //    $page.params.collection,
        //     'unique()',
        //     newDocument,
        //     read,
        //     write
        // );
    };

    const comp = (attr: Attributes) => {
        if (attr.array) {
            if (attr.type === 'string')
                switch (attr?.format) {
                    case 'email':
                        return InputEmail;
                    case 'enum':
                        return InputSelect;

                    default:
                        return InputText;
                }
            else {
                switch (attr?.type) {
                    case 'boolean':
                        return InputSelect;
                    case 'double':
                        return InputNumber;
                    case 'integer':
                        return InputNumber;

                    default:
                        return InputText;
                }
            }
        } else {
            if (attr.type === 'string')
                switch (attr?.format) {
                    case 'email':
                        return InputEmail;
                    case 'enum':
                        return InputSelect;

                    default:
                        return InputText;
                }
            else {
                switch (attr?.type) {
                    case 'boolean':
                        return InputCheckbox;
                    case 'double':
                        return InputNumber;
                    case 'integer':
                        return InputNumber;

                    default:
                        return InputText;
                }
            }
        }
    };

    const nextStep = () => {
        steps[currentStep].current = false;
        steps[currentStep].completed = true;
        currentStep++;
        steps[currentStep].current = true;
    };
    const prevStep = () => {
        steps[currentStep].current = false;
        currentStep--;
        steps[currentStep].current = true;
        steps[currentStep].completed = false;
    };
</script>

<Wizard title="Create document" bind:show={showCreate}>
    <svelte:fragment slot="aside">
        <Steps>
            {#each steps as step}
                <Step current={step.current} completed={step.completed}>
                    {step.title}
                </Step>
            {/each}
        </Steps>
    </svelte:fragment>
    <Form on:submit={create}>
        <header class="form-header">
            <h1 class="heading-level-6">Create document data</h1>
            <p>Provide document data based on attributes you created earlier.</p>
        </header>
        {#if $attributeList?.total}
            <div class="form-content">
                <FormList>
                    {#each $attributeList.attributes as attribute}
                        {#if attribute?.array}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <svelte:component
                                        this={comp(attribute)}
                                        label={attribute.key}
                                        id={attribute.key}
                                        required={attribute.required}
                                        placeholder={attribute.key}
                                        options={attribute.type === 'boolean'
                                            ? [
                                                  { value: true, label: 'True' },
                                                  { value: false, label: 'False' }
                                              ]
                                            : attribute?.elements?.map((n) => {
                                                  return { value: n, label: n };
                                              })}
                                        bind:value={newDocument[attribute.key]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button text>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {:else}
                            <svelte:component
                                this={comp(attribute)}
                                label={attribute.key}
                                id={attribute.key}
                                required={attribute.required}
                                placeholder={attribute.key}
                                minlength={attribute?.min}
                                maxlength={attribute?.max}
                                step={attribute.type === 'double' ? 0.1 : 1}
                                bind:value={newDocument[attribute.key]}
                                options={attribute?.elements?.map((n) => {
                                    return { value: n, label: n };
                                })} />
                        {/if}
                    {/each}
                </FormList>
            </div>
        {/if}

        <div class="form-footer">
            <div class="u-flex u-main-end u-gap-12">
                {#if currentStep === 0}
                    <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
                    <Button on:click={nextStep}>Next</Button>
                {:else if currentStep === steps.length - 1}
                    <Button secondary on:click={prevStep}>Back</Button>
                    <Button submit>Create</Button>
                {:else}
                    <Button secondary on:click={prevStep}>Back</Button>
                    <Button on:click={nextStep}>Next</Button>
                {/if}
            </div>
        </div>
    </Form>
</Wizard>
