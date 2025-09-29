<script lang="ts">
    import Helper from '$lib/elements/forms/helper.svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconChevronDown } from '@appwrite.io/pink-icons-svelte';

    // TODO: @itznotabug: svelte5

    export let value: string;
    export let id: string;
    export let label: string;
    export let required = false;

    let element: HTMLSelectElement;

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

<label class="label" for={id}>{label}</label>
<div class="select">
    <select bind:this={element} {id} bind:value {required} on:invalid={handleInvalid}>
        <slot />
    </select>
    <Icon icon={IconChevronDown} size="s" />
</div>
{#if error}
    <Helper type="warning">{error}</Helper>
{/if}
