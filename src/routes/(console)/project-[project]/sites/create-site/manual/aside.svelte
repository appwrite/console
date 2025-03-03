<script lang="ts">
    import { base } from '$app/paths';
    import { Card } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import { IconDownload } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';

    let framework: 'react' | 'vue' | 'angular' | 'svelte' | 'web' = 'web';

    let starterKit;
</script>

<Card padding="xs">
    <Layout.Stack gap="xxs">
        <Typography.Text variant="m-500">Don't have a site yet?</Typography.Text>
        <Typography.Text variant="m-400">
            Download our starter kit, and deploy in seconds.
        </Typography.Text>
    </Layout.Stack>

    <Layout.Stack>
        <InputSelect
            id="framework"
            options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Angular', value: 'angular' },
                { label: 'Svelte', value: 'svelte' },
                { label: 'Web', value: 'web' }
            ]}
            bind:value={framework} />

        <Image
            ratio="16/9"
            src={starterKit?.preview ||
                ($app.themeInUse === 'dark'
                    ? `${base}/images/sites/screenshot-placeholder-dark.svg`
                    : `${base}/images/sites/screenshot-placeholder-light.svg`)}
            alt="preview" />

        <Button fullWidth secondary href="#">
            <Icon icon={IconDownload} slot="start" /> Starter kit
        </Button>
    </Layout.Stack>
</Card>
