<script lang="ts">
    import { onMount } from 'svelte';

    export let name: string;
    export let group: string;
    export let value: string | number | boolean;
    export let disabled = false;
    export let padding = 1;
    export let autofocus = false;
    export let fullHeight = true;
    export let borderRadius: 'xsmall' | 'small' | 'medium' | 'large' = 'small';

    enum Radius {
        xsmall = '--border-radius-xsmall',
        small = '--border-radius-small',
        medium = '--border-radius-medium',
        large = '--border-radius-large'
    }

    let labelReference: HTMLLabelElement | null = null;

    onMount(() => {
        if (autofocus) {
            labelReference?.focus();
        }
    });
</script>

<label
    bind:this={labelReference}
    class="box u-cursor-pointer u-flex u-flex-vertical u-gap-16"
    class:is-allow-focus={!disabled}
    class:is-disabled={disabled}
    class:u-height-100-percent={fullHeight}
    style:--box-padding={`${padding}rem`}
    style:--box-border-radius={`var(${Radius[borderRadius]})`}>
    <input
        class="is-small u-margin-block-start-2"
        type="radio"
        {name}
        {disabled}
        {value}
        bind:group
        on:click />
    <slot />
</label>
