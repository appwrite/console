<script>
    export let hideSidebar = false;
</script>

<div class="wizard-secondary-content">
    <div class="wizard-secondary-content-1">
        <slot />
    </div>
    {#if !hideSidebar}
        <div class="wizard-secondary-content-sep"></div>
        <div class="wizard-secondary-content-2">
            <slot name="aside" />
        </div>
    {/if}
</div>
