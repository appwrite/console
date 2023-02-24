<script lang="ts">
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import { WizardStep } from '$lib/layout';
    import { createTransfer } from '../store';

    let options = [
        {
            name: 'Users',
            description: 'Users and their associated data',
            icon: 'user',
            checked: false
        },
        {
            name: 'Files',
            description: 'Files and their associated data',
            icon: 'file',
            checked: false
        },
        {
            name: 'Databases',
            description: 'Databases and their associated data excluding data in the database',
            icon: 'database',
            checked: false
        },
        {
            name: 'Documents',
            description:
                'Documents and their associated data, requires Databases to also be selected',
            icon: 'document',
            checked: false
        },
        {
            name: 'Functions',
            description: 'Functions and their associated data',
            icon: 'function',
            checked: false
        }
    ];

    $: $createTransfer.resources = options
        .filter((option) => option.checked)
        .map((option) => option.name);
</script>

<WizardStep>
    <svelte:fragment slot="title">Create your Transfer</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please select the resources you want to use for this transfer.</svelte:fragment>
    <FormList>
        {#each options as option}
            <InputCheckbox
                label={option.name}
                optionalText={option.description}
                id={option.name}
                bind:value={option.checked} />
        {/each}
    </FormList>
</WizardStep>
