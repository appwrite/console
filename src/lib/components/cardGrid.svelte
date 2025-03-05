<script lang="ts">
    import { Divider, Layout, Card, Typography } from '@appwrite.io/pink-svelte';

    export let hideOverflow = false;
    export let hideFooter = false;
</script>

<Card.Base>
    <Layout.Stack gap="xl" justifyContent="space-around">
        <Layout.GridFraction gap="xxxl" rowGap="xl" start={1} end={2}>
            <Layout.Stack gap="xxs">
                <Typography.Title size="s"><slot name="title" /></Typography.Title>
                {#if $$slots.default}
                    <Typography.Text>
                        <slot />
                    </Typography.Text>
                {/if}
            </Layout.Stack>
            <Layout.Stack gap="l">
                <slot name="aside" />
            </Layout.Stack>
        </Layout.GridFraction>
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
