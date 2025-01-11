<script lang="ts">
    import { LabelCard, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import RepoDark from './(images)/repositoryDark.svg';
    import RepoLight from './(images)/repositoryLight.svg';
    import TemplateDark from './(images)/templateDark.svg';
    import TemplateLight from './(images)/templateLight.svg';
    import { app } from '$lib/stores/app';

    export let show = false;
    let behaviour: 'repositories' | 'templates';

    $: if (!show) {
        behaviour = null;
    }
</script>

<Modal title="Create site" bind:show>
    <Layout.Stack direction="row" gap="m" wrap="wrap">
        <div style="flex-grow: 1; min-width: 245px">
            <Layout.Stack direction="column" justifyContent="center">
                <LabelCard
                    variant="secondary"
                    padding="xs"
                    radius="s"
                    imageRadius="xxs"
                    src={$app?.themeInUse === 'dark' ? RepoDark : RepoLight}
                    title="Connect a repository"
                    name="connect"
                    bind:group={behaviour}
                    value="repositories">
                    Connect to one of your existing Git repositories
                </LabelCard>
            </Layout.Stack>
        </div>
        <div style="flex-grow: 1; min-width: 245px">
            <Layout.Stack direction="column" justifyContent="center">
                <LabelCard
                    variant="secondary"
                    padding="xs"
                    radius="s"
                    imageRadius="xxs"
                    src={$app?.themeInUse === 'dark' ? TemplateDark : TemplateLight}
                    title="Clone a template"
                    name="clone"
                    bind:group={behaviour}
                    value="templates">
                    Clone a pre-built template to quickly set up your site
                </LabelCard>
            </Layout.Stack>
        </div>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button
            disabled={!behaviour}
            size="s"
            href={`${base}/project-${$page.params.project}/sites/create-site/${behaviour}`}>
            Next
        </Button>
    </svelte:fragment>
</Modal>
