<div class="box">
    <div class="u-flex u-gap-16">
        <slot name="image" />
        <div class="u-cross-child-center u-line-height-1-5">
            <slot name="title" />
            <slot />
        </div>
        {#if $$slots?.end}
            <div class="u-margin-inline-start-auto"><slot name="end" /></div>
        {/if}
    </div>
</div>
