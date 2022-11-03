<script lang="ts">
    export let withIndentation = false;
</script>

<li class="collapsible-item">
    <details class="collapsible-wrapper">
        <summary class="collapsible-button">
            <span class="text"><slot name="title" /></span>
            <span class="collapsible-button-optional"><slot name="subtitle" /></span>
            <div class="icon">
                <span class="icon-cheveron-down" aria-hidden="true" />
            </div>
        </summary>
        <div class="collapsible-content" class:indentation={withIndentation}>
            <slot />
        </div>
    </details>
</li>

<style>
    .indentation {
        padding-inline-start: 1.5rem;
    }
</style>
