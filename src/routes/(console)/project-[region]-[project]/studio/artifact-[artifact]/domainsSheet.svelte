<script lang="ts">
    import { Sheet, Layout, Typography } from '@appwrite.io/pink-svelte';

    type Props = {
        primaryDomain: string;
        open?: boolean;
    };

    let { open, primaryDomain }: Props = $props();
</script>

<Sheet bind:open>
    <div slot="header" style:width="100%">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Layout.Stack direction="row" gap="m" alignItems="center">
                <Typography.Text variant="m-400">Domains</Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
    </div>
    <Layout.Stack>
        <Typography.Text>{primaryDomain}</Typography.Text>
    </Layout.Stack>
</Sheet>
