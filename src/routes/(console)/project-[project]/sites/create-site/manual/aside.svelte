<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
</script>

<Card padding="xs">
    <Layout.Stack gap="xxs">
        <Typography.Text variant="m-500">Don't have a site yet?</Typography.Text>
        <Typography.Text variant="m-400">
            Deploy the JavaScript starter template in seconds.
        </Typography.Text>
    </Layout.Stack>

    <Layout.Stack>
        <!-- <Image
            ratio="16/9"
            src={$app.themeInUse === 'dark'
                ? `${base}/images/sites/screenshot-placeholder-dark.svg`
                : `${base}/images/sites/screenshot-placeholder-light.svg`}
            alt="preview" /> -->

        <Button
            fullWidth
            secondary
            href={`${base}/project-${$page.params.project}/sites/create-site/templates/template-starter-for-js`}>
            Deploy
        </Button>
    </Layout.Stack>
</Card>
