<script lang="ts">
    export let name: string;
    export let group: string;
    export let value: string | number | boolean;
    export let disabled = false;
    export let padding = 1;
    export let icon: string = null;
    export let fullHeight = true;
    export let borderRadius: 'xsmall' | 'small' | 'medium' | 'large' = 'small';

    enum Radius {
        xsmall = '--border-radius-xsmall',
        small = '--border-radius-small',
        medium = '--border-radius-medium',
        large = '--border-radius-large'
    }
</script>

<label
    class="card is-allow-focus u-cursor-pointer"
    class:u-height-100-percent={fullHeight}
    style:--card-padding={`${padding}rem`}
    style:--card-border-radius={`var(${Radius[borderRadius]})`}>
    <div class="u-flex u-gap-16">
        <input
            class="is-small u-margin-block-start-2"
            type="radio"
            {name}
            {disabled}
            {value}
            bind:group
            on:click />
        <div class="u-flex u-flex-vertical u-gap-4">
            {#if $$slots.title}
                <h4 class="body-text-2 u-bold"><slot name="title" /></h4>
            {/if}
            {#if $$slots.default}
                <p class="u-color-text-gray u-small">
                    <slot />
                </p>
            {/if}
        </div>
        {#if icon}
            <span class={`icon-${icon} u-margin-inline-start-auto`} aria-hidden="true" />
        {/if}
    </div>
</label>
