<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';
    import TextCounter from './textCounter.svelte';

    export let value = '';
    export let autofocus = true;

    let element: HTMLInputElement;
    let icon = 'info';
    const pattern = String.raw`^[a-z0-9][a-z0-9\-]*$`;
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
        <TextCounter count={value?.length ?? 0} max={36} />
    </div>
</FormItem>
<div
    class="u-flex u-gap-4 u-margin-block-start-8 u-small"
    class:u-color-text-warning={icon === 'exclamation'}>
    <span
        class:icon-info={icon === 'info'}
        class:icon-exclamation={icon === 'exclamation'}
        class="u-cross-center u-line-height-1 u-color-text-gray"
        aria-hidden="true" />
    <span class="text u-line-height-1-5">
        Allowed characters: lowercase alphanumeric and non-leading hyphen
    </span>
</div>
