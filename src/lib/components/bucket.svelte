<script>
    export let href;
</script>

<a class="card" {href}>
    <div class="bucket">
        <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
        <h2 class="heading-level-6"><slot name="title" /></h2>
        <div class="bucket-status">
            <slot name="status" />
        </div>
        <div class="bucket-options">
            <slot />
        </div>
        <ul class="bucket-icons u-flex u-gap-8">
            <slot name="icons" />
        </ul>
    </div>
</a>
