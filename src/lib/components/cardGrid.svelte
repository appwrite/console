<script>
    import { Card } from './';
</script>

<Card>
    <div class="common-section grid-1-2">
        <div class="grid-1-2-col-1">
            <slot />
        </div>
        <div class="grid-1-2-col-2">
            <slot name="right" />
        </div>
    </div>
    <div class="common-section card-separator u-flex u-main-end">
        <slot name="actions" />
    </div>
</Card>
