<script lang="ts">
    import { Divider, Layout, Card, Typography } from '@appwrite.io/pink-svelte';

    export let overflow = true;
    export let hideFooter = false;
    export let gap: 'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' = 'l';
</script>

<Card.Base>
    <Layout.Stack gap="xl" justifyContent="space-around">
        <div class="card-grid-content">
            <Layout.Stack gap="xxs" class="card-grid-main">
                <Typography.Title size="s" truncate><slot name="title" /></Typography.Title>
                {#if $$slots.default}
                    <Typography.Text>
                        <slot />
                    </Typography.Text>
                {/if}
            </Layout.Stack>
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

<style>
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
