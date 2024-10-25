<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics.js';
    import Card from '$lib/components/card.svelte';
    import Repositories from '$lib/components/repositories.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { WizardSecondaryContainer, WizardSecondaryContent } from '$lib/layout/index.js';
    import { installation, repository } from '$lib/stores/vcs.js';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let data;
    let hasInstallations = !!data?.installations?.total;
    let selectedRepository: string = null;
</script>

<WizardSecondaryContainer href={`${base}/project-${$page.params.project}/sites/`}>
    <svelte:fragment slot="title">Create site</svelte:fragment>
    <WizardSecondaryContent>
        <Repositories
            bind:hasInstallations
            bind:selectedRepository
            action="button"
            callbackState={{
                from: 'github',
                to: 'cover'
            }}
            on:connect={(e) => {
                trackEvent('click_connect_repository', {
                    from: 'cover'
                });
                repository.set(e.detail);
                goto(
                    `${base}/project-${$page.params.project}/sites/create-site/repositories/repository-${e.detail.id}?installation=${$installation.$id}`
                );
            }} />
        <svelte:fragment slot="aside">
            <Card>
                <Layout.Stack gap="m">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variation="m-500">Missing a repository?</Typography.Text>
                        <p>
                            Check your permissions in GitHub, your repository might be set to
                            private.
                        </p>
                    </Layout.Stack>
                    <Layout.Stack direction="row" gap="s">
                        <Button href="https://appwrite.io" secondary>Docs</Button>
                        {#if hasInstallations}
                            <Button
                                href={`https://github.com/${data.installations.installations[0].organization}`}
                                text>Go to GitHub</Button>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Card>
        </svelte:fragment>
    </WizardSecondaryContent>
</WizardSecondaryContainer>
