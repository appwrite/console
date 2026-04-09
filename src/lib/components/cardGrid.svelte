<script lang="ts">
    import { Divider, Layout, Card, Typography } from '@appwrite.io/pink-svelte';

    export let overflow = true;
    export let hideFooter = false;
    export let gap: 'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' = 'l';
</script>

<div class="card-grid-wrapper">
    <Card.Base>
        <Layout.Stack gap="xl" justifyContent="space-around">
            <div class="card-grid-content">
                <div class="card-grid-main">
                    <Layout.Stack gap="xxs">
                        <Typography.Title size="s" truncate><slot name="title" /></Typography.Title>
                        {#if $$slots.default}
                            <Typography.Text>
                                <slot />
                            </Typography.Text>
                        {/if}
                    </Layout.Stack>
                </div>
                <div class="card-grid-aside" style:overflow={overflow ? 'visible' : 'hidden'}>
                    <Layout.Stack {gap}>
                        <slot name="aside" />
                    </Layout.Stack>
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
</div>

<style>
    .card-grid-wrapper :global(.card) {
        transition:
            transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, box-shadow;
    }

    .card-grid-wrapper :global(.card:hover) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .card-grid-wrapper :global(.card:active) {
        transform: translateY(0);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }

    .card-grid-content {
        display: grid;
        gap: var(--space-10);
        align-items: start;
        grid-template-columns: minmax(0, 1fr);
    }

    .card-grid-main,
    .card-grid-aside {
        min-width: 0;
    }

    @media (min-width: 769px) {
        .card-grid-content {
            column-gap: var(--space-13);
            row-gap: var(--space-10);
            grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
        }
    }
</style>