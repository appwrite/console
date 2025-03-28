<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let withIndentation = false;
    export let open = false;
    export let disabled = false;
    export let noContent = false;
    export let isInfo = false;
    export let gap = 16;

    export let style = null;
    export let wrapperStyle = null;
</script>

<li class="collapsible-item" class:is-info={isInfo}>
    {#if noContent}
        <div class="collapsible-wrapper" style={wrapperStyle}>
            <div class={`collapsible-button u-gap-${gap}`} {style}>
                <slot />
            </div>
        </div>
    {:else}
        <details class="collapsible-wrapper" class:is-disabled={disabled} bind:open>
            <!-- svelte-ignore a11y-no-redundant-roles -->
            <summary
                class={`collapsible-button u-position-relative u-gap-${gap}`}
                style="padding: 0"
                on:keyup={clickOnEnter}
                on:click
                role="button"
                tabindex="0">
                <slot name="beforetitle" />
                <div>
                    <span class="text" class:u-color-text-disabled={disabled}>
                        <slot name="title" /></span>
                    {#if $$slots.subtitle}
                        <span
                            class="collapsible-button-optional"
                            class:u-color-text-disabled={disabled}><slot name="subtitle" /></span>
                    {/if}
                </div>
                <slot name="end">
                    <div class="icon">
                        <span
                            class="icon-cheveron-down u-font-size-20"
                            class:u-color-text-disabled={disabled}
                            aria-hidden="true"></span>
                    </div>
                </slot>
            </summary>
            <div
                class="collapsible-content"
                class:u-margin-block-start-8={withIndentation}
                class:u-padding-inline-32={withIndentation}>
                <slot />
            </div>
        </details>
    {/if}
</li>

<style lang="scss">
    // TODO: remove once pink is updated
    .collapsible-item:not(.is-info) {
        .collapsible-wrapper {
            padding: 0;
        }
        .collapsible-wrapper.is-disabled {
            cursor: not-allowed;

            &[open] .icon-cheveron-down {
                rotate: unset;
            }
            * {
                cursor: not-allowed;
            }
            .collapsible {
                &-content {
                    display: none !important;
                }
            }
        }
    }
</style>
