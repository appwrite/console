<script lang="ts">
    import { Divider, Layout, Card } from '@appwrite.io/pink-svelte';

    export let hideOverflow = false;
    export let hideFooter = false;
</script>

<Card.Base>
    <Layout.Stack gap="xl" justifyContent="space-around">
        <div class="common-section grid-1-2" class:hideOverflow>
            <div class="grid-1-2-col-1 u-flex u-flex-vertical u-gap-16">
                <slot />
            </div>
            <div class="grid-1-2-col-2 u-flex u-flex-vertical u-gap-16 u-min-width-0">
                <slot name="aside" />
            </div>
        </div>
        {#if $$slots.actions && !hideFooter}
            <span
                style="margin-left: calc(-1* var(--space-9));margin-right: calc(-1* var(--space-9));width:auto;">
                <Divider />
            </span>
            <Layout.Stack direction="row-reverse">
                <slot name="actions" />
            </Layout.Stack>
        {/if}
    </Layout.Stack>
</Card.Base>

<style lang="scss">
    .hideOverflow > * {
        width: 100%;
        overflow: hidden;
    }
</style>
