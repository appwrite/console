<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let withIndentation = false;
    export let open = false;
</script>

<li class="collapsible-item">
    <details class="collapsible-wrapper" {open}>
        <!-- svelte-ignore a11y-no-redundant-roles -->
        <summary
            class="collapsible-button"
            on:keyup={clickOnEnter}
            on:click
            role="button"
            tabindex="0">
            <slot name="beforetitle" />
            <div>
                <span class="text"><slot name="title" /></span>
                {#if $$slots.subtitle}
                    <span class="collapsible-button-optional"><slot name="subtitle" /></span>
                {/if}
            </div>
            <div class="icon">
                <span class="icon-cheveron-down" aria-hidden="true" />
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
