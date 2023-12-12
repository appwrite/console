<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';

    export let name: string;
    export let group: string;
    export let value: string | number | boolean;
    export let disabled = false;
    export let padding = 1;
    export let icon: string = null;
    export let fullHeight = true;
    export let borderRadius: 'xsmall' | 'small' | 'medium' | 'large' = 'small';
    export let backgroundColor: string = null;
    export let backgroundColorHover: string = null;
    export let tooltipText: string = null;
    export let showTooltip = false;

    enum Radius {
        xsmall = '--border-radius-xsmall',
        small = '--border-radius-small',
        medium = '--border-radius-medium',
        large = '--border-radius-large'
    }
</script>

<label
    class="card u-cursor-pointer"
    class:is-allow-focus={!disabled}
    class:is-disabled={disabled}
    class:u-height-100-percent={fullHeight}
    style:--card-padding={`${padding}rem`}
    style:--card-border-radius={`var(${Radius[borderRadius]})`}
    style:--p-card-bg-color-default={backgroundColor}
    style:--p-card-bg-color-hover={backgroundColorHover}
    use:tooltip={{ content: tooltipText, disabled: !tooltipText || !showTooltip }}>
    <div class="u-flex u-gap-8">
        <input
            class="is-small u-margin-block-start-2"
            type="radio"
            {name}
            {disabled}
            {value}
            bind:group
            on:click />
        {#if $$slots.custom}
            <slot name="custom" {disabled} />
        {:else}
            <div class="u-flex u-flex-vertical u-gap-4" class:u-opacity-50={disabled}>
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
        {/if}
    </div>
</label>
