<li class="collapsible-item">
    <details class="collapsible-wrapper">
        <summary class="collapsible-button">
            <span class="text"><slot name="title" /></span>
            <span class="collapsible-button-optional"><slot name="subtitle" /></span>
            <div class="icon">
                <span class="icon-cheveron-down" aria-hidden="true" />
            </div>
        </summary>
        <div class="collapsible-content">
            <slot />
        </div>
    </details>
</li>
