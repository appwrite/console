<script lang="ts">
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    export let href: string;
</script>

<Card.Link class="card" {href}>
    <Layout.Stack height="calc(182 / 16 * 1rem)" justifyContent="space-between">
        <Layout.Stack direction="row">
            <Layout.Stack gap="xs">
                <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary"
                    ><slot name="eyebrow" /></Typography.Caption>
                <Typography.Title size="s" truncate><slot name="title" /></Typography.Title>
                <div>
                    <slot name="subtitle" />
                </div>
            </Layout.Stack>
            <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center">
                <slot name="status" />
            </Layout.Stack>
        </Layout.Stack>
        <Layout.Stack direction="row">
            <Layout.Stack direction="row">
                <slot />
            </Layout.Stack>
            <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center">
                <slot name="icons" />
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
</Card.Link>
