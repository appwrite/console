<script lang="ts">
    import { LabelCard, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import RepoDark from './repositoryDark.svg';
    import RepoLight from './repositoryLight.svg';
    import TemplateDark from './templateDark.svg';
    import TemplateLight from './templateLight.svg';
    import { app } from '$lib/stores/app';

    export let show = false;
    let behaviour: 'repositories' | 'templates';

    $: if (!show) {
        behaviour = null;
    }
</script>

<Modal title="Create site" size="big" bind:show>
    <Layout.Stack direction="row" gap="m" wrap="wrap">
        <div style="flex-grow: 1; min-width: 245px">
            <LabelCard
                padding="small"
                src={$app?.themeInUse === 'dark' ? RepoDark : RepoLight}
                title="Connect a repository"
                name="connect"
                bind:group={behaviour}
                value="repositories">
                Connect to one of your existing Git repositories
            </LabelCard>
        </div>
        <div style="flex-grow: 1; min-width: 245px">
            <LabelCard
                padding="small"
                src={$app?.themeInUse === 'dark' ? TemplateDark : TemplateLight}
                title="Connect a template"
                name="connect"
                bind:group={behaviour}
                value="templates">
                Connect to one of your existing Git repositories
            </LabelCard>
        </div>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button
            disabled={!behaviour}
            href={`${base}/project-${$page.params.project}/sites/create-site/${behaviour}`}
            >Next</Button>
    </svelte:fragment>
</Modal>
