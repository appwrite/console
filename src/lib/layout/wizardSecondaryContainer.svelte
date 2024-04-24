<section class="wizard-secondary c-wizard-position">
    <div class="wizard-secondary-container">
        <slot />
    </div>
</section>

<style lang="scss">
    .c-wizard-position {
        background-color: hsl(var(--p-body-bg-color));
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 30;
        width: 100%;
        height: 100%;
        max-height: 100vh;
    }
</style>
