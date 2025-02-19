<script lang="ts">
    import { Card } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { IconDownload } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';

    let framework: 'react' | 'vue' | 'angular' | 'svelte' | 'web' = 'web';
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

        <Image src="https://placehold.co/349x201/111/bbb?text=Preview&font=inter" alt="preview" />

        <Button size="s" fullWidth secondary href="#">
            <Icon icon={IconDownload} /> Starter kit
        </Button>
    </Layout.Stack>
</Card>
