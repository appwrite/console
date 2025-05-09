<script lang="ts">
    import { Card, Modal } from '$lib/components';
    import { Image, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import RepoDark from './(images)/repositoryDark.svg';
    import RepoLight from './(images)/repositoryLight.svg';
    import TemplateDark from './(images)/templateDark.svg';
    import TemplateLight from './(images)/templateLight.svg';
    import { app } from '$lib/stores/app';
    import { Link } from '$lib/elements';

    export let show = false;
</script>

<Modal title="Create site" bind:show hideFooter>
    <Layout.Stack direction="row" gap="m" wrap="wrap">
        <div style="flex-grow: 1; min-width: 245px">
            <Card
                variant="secondary"
                padding="xs"
                radius="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/sites/create-site/templates`}>
                <Image
                    alt="repositories"
                    radius="xxs"
                    ratio="16/9"
                    src={$app?.themeInUse === 'dark' ? TemplateDark : TemplateLight} />
                <Layout.Stack gap="s">
                    <Typography.Text variant="m-600">Clone a template</Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        Clone a pre-built template to quickly set up your site
                    </Typography.Text>
                </Layout.Stack>
            </Card>
        </div>
        <div style="flex-grow: 1; min-width: 245px">
            <Card
                variant="secondary"
                padding="xs"
                radius="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/sites/create-site/repositories`}>
                <Image
                    alt="repositories"
                    radius="xxs"
                    ratio="16/9"
                    src={$app?.themeInUse === 'dark' ? RepoDark : RepoLight} />

                <Layout.Stack gap="s">
                    <Typography.Text variant="m-600">Connect a repository</Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        Connect to one of your existing Git repositories
                    </Typography.Text>
                </Layout.Stack>
            </Card>
        </div>
    </Layout.Stack>
    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
        Or simply drag and drop your files to create a site <Link
            variant="muted"
            href={`${base}/project-${page.params.region}-${page.params.project}/sites/create-site/manual`}>
            manually</Link
        >.
    </Typography.Text>
</Modal>
