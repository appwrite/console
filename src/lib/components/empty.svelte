<script>
    import { Card } from '.';
</script>

<Card>
    <b>
        <slot name="header" />
    </b>
    <p>
        <slot />
    </p>
</Card>
