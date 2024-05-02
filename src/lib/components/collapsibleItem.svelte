<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let withIndentation = false;
    export let open = false;
    export let disabled = false;
</script>

<li class="collapsible-item">
    <details class="collapsible-wrapper" class:is-disabled={disabled} bind:open>
        <!-- svelte-ignore a11y-no-redundant-roles -->
        <summary
            class="collapsible-button u-position-relative"
            on:keyup={clickOnEnter}
            on:click
            role="button"
            tabindex="0">
            <slot name="beforetitle" />
            <div>
                <span class="text" class:u-color-text-disabled={disabled}
                    ><slot name="title" /></span>
                {#if $$slots.subtitle}
                    <span class="collapsible-button-optional" class:u-color-text-disabled={disabled}
                        ><slot name="subtitle" /></span>
                {/if}
            </div>
            <div class="icon">
                <span
                    class="icon-cheveron-down u-font-size-20"
                    class:u-color-text-disabled={disabled}
                    aria-hidden="true" />
            </div>
        </summary>
        <div
            class="collapsible-content"
            class:u-margin-block-start-8={withIndentation}
            class:u-padding-inline-32={withIndentation}>
            <slot />
        </div>
    </details>
</li>

<style lang="scss">
    // TODO: remove once pink is updated
    .collapsible-item {
        .collapsible-wrapper.is-disabled {
            &[open] .icon-cheveron-down {
                rotate: unset;
            }

            cursor: not-allowed;
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
