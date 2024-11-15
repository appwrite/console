<script lang="ts">
    import { Modal, Card } from '$lib/components';
    import Repositories from '$lib/components/repositories.svelte';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Icon, InlineCode, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let show = false;

    let installations = { installations: [], total: 0 };
    let selectedRepository: string = null;

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();

        console.log(installations);
    });
</script>

<Modal title="Create Git deployment" bind:show>
    <span slot="description">
        Enter a valid commit reference to create a new deployment from <InlineCode code="test" /> or
        use the CLI to deploy. <Link href="#">Learn more</Link>
    </span>
    <Card isTile padding="s" radius="s">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center" gap="xs">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Icon size="s" icon={IconGithub} />
                <Typography.Text variant="m-400" color="--color-fgcolor-neutral-primary">
                    name
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
    </Card>
    <Repositories
        bind:selectedRepository
        installationList={installations}
        action="button"
        callbackState={{
            from: 'github',
            to: 'cover'
        }}
        on:connect={() => console.log('test')} />
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s">Next</Button>
    </svelte:fragment>
</Modal>
