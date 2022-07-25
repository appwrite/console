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
        Button
    } from '$lib/elements/forms';
    import { collection } from './store';
    import { sdkForProject } from '$lib/stores/sdk';

    export let showCreate = false;

    let steps = [
        { title: 'Create data', current: true, completed: false },
        { title: 'Set permissions', current: false, completed: false }
    ];

    let currentStep = 0;

    const comp = (type: string) => {
        switch (type) {
            case 'boolean':
                return InputCheckbox;
            case 'email':
                return InputEmail;
            case 'float':
                return InputNumber;
            case 'integer':
                return InputNumber;

            default:
                return InputText;
        }
    };

    let newDocument = {};
    let read: string[];
    let write: string[];

    const create = async () => {
        await sdkForProject.databases.createDocument(
            $collection.$id,
            'unique()',
            newDocument,
            read,
            write
        );
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
        <div class="form-content">
            <FormList>
                {#each $collection.attributes as attribute}
                    <svelte:component
                        this={comp(attribute.type)}
                        label={attribute.key}
                        id={attribute.key}
                        required={attribute.required}
                        bind:value={newDocument[attribute.key]} />
                {/each}
            </FormList>
        </div>

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
