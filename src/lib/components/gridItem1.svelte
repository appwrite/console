<script>
    export let href;
</script>

<a class="card" {href}>
    <div class="grid-item-1">
        <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
        <h2 class="heading-level-6"><slot name="title" /></h2>
        <div class="status">
            <slot name="status" />
        </div>
        <div class="options">
            <slot />
        </div>
        <ul class="icons u-flex u-gap-8">
            <slot name="icons" />
        </ul>
    </div>
</a>
