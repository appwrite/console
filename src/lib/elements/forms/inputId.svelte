<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';

    export let value = '';
    export let autofocus = true;

    let element: HTMLInputElement;
    let icon = 'info';
    const pattern = String.raw`^[a-zA-Z0-9][a-zA-Z0-9._-]*$`;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.patternMismatch) {
            icon = 'exclamation';
            return;
        }
    };

    $: if (value) {
        icon = 'info';
    }
</script>

<FormItem>
    <div class="input-text-wrapper">
        <input
            id="id"
            placeholder="Enter ID"
            maxlength={36}
            {pattern}
            autocomplete="off"
            type="text"
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
        <span class="text-counter">
            <span class="text-counter-count">{value?.length ?? 0}</span>
            <span class="text-counter-separator" />
            <span class="text-counter-max">36</span>
        </span>
    </div>
</FormItem>
<div
    class="u-flex u-gap-4 u-margin-block-start-8 u-small"
    class:u-color-text-warning={icon === 'exclamation'}>
    <span
        class:icon-info={icon === 'info'}
        class:icon-exclamation={icon === 'exclamation'}
        class="u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
        aria-hidden="true" />
    <span class="text u-line-height-1-5">
        Allowed characters: alphanumeric, non-leading hyphen, underscore, period
    </span>
</div>
