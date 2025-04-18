<div class="wizard-secondary-content">
    <div class="wizard-secondary-content-1">
        <slot />
    </div>
    {#if $$slots.aside}
        <div class="wizard-secondary-content-sep"></div>
        <div class="wizard-secondary-content-2">
            <slot name="aside" />
        </div>
    {/if}
</div>
