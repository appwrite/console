<script lang="ts">
    export let withIndentation = false;
    export let open = false;
</script>

<li class="collapsible-item">
    <details class="collapsible-wrapper" {open}>
        <summary class="collapsible-button">
            <slot name="beforetitle" />
            <div>
                <span class="text"><slot name="title" /></span>
                <span class="collapsible-button-optional"><slot name="subtitle" /></span>
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
