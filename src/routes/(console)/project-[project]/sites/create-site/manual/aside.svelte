<script lang="ts">
    import { base } from '$app/paths';
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import { IconDownload } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';
</script>

<Card padding="xs">
    <Layout.Stack gap="xxs">
        <Typography.Text variant="m-500">Don't have a site yet?</Typography.Text>
        <Typography.Text variant="m-400">
            Download our starter kit, and deploy in seconds.
        </Typography.Text>
    </Layout.Stack>

    <Layout.Stack>
        <Image
            ratio="16/9"
            src={$app.themeInUse === 'dark'
                ? `${base}/images/sites/screenshot-placeholder-dark.svg`
                : `${base}/images/sites/screenshot-placeholder-light.svg`}
            alt="preview" />

        <Button fullWidth secondary href="#">
            <Icon icon={IconDownload} slot="start" /> Starter kit
        </Button>
    </Layout.Stack>
</Card>
