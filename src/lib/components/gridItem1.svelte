<script>
    export let href;
</script>

<a class="card" {href}>
    <div class="grid-item-1">
        <div class="grid-item-1-start-start">
            <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
            <h2 class="heading-level-6"><slot name="title" /></h2>
        </div>
        <div class="grid-item-1-start-end">
            <slot name="status" />
        </div>

        <div class="grid-item-1-end-start">
            <div class="u-flex u-gap-16 u-flex-wrap">
                <slot />
            </div>
        </div>
        <div class="grid-item-1-end-end">
            <ul class="icons u-flex u-gap-8">
                <slot name="icons" />
            </ul>
        </div>
    </div>
</a>
