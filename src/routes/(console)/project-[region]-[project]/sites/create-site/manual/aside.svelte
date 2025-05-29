<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { getProjectRoute } from '$lib/helpers/project';
    import { Image, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let template: Models.TemplateSite;
</script>

<Card padding="xs">
    <Layout.Stack gap="xxs">
        <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
            Don't have a site yet?
        </Typography.Text>
        <Typography.Text variant="m-400">
            Deploy the JavaScript starter template in seconds.
        </Typography.Text>
    </Layout.Stack>

    <Layout.Stack>
        <Image
            ratio="16/9"
            src={$app.themeInUse === 'dark' ? template.screenshotDark : template.screenshotLight}
            alt="preview" />

        <Button
            fullWidth
            secondary
            href={getProjectRoute(`/sites/create-site/templates/template-${template.key}`)}>
            Use template
        </Button>
    </Layout.Stack>
</Card>
