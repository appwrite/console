<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';
    import type Radio from '@appwrite.io/pink-svelte/dist/selector/Radio.svelte';

    import type { ComponentProps } from 'svelte';

    type Props = ComponentProps<Radio>;

    export let label: string = null;
    export let showLabel = true;
    export let id: string;
    export let group: string;
    export let value: string;
    export let name: string;
    export let required = false;
    export let disabled = false;
    export let size: Props['size'] = 'medium';

    let element: HTMLInputElement;
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Selector.Radio
    {id}
    {name}
    {disabled}
    {required}
    {value}
    {label}
    {size}
    bind:group
    on:invalid={handleInvalid} />
