<script lang="ts">
    import { Modal } from '$lib/components';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { InlineCode, Layout } from '@appwrite.io/pink-svelte';

    export let show = false;
</script>

<Modal title="Create Git deployment" bind:show>
    <span slot="description">
        Enter a valid commit reference to create a new deployment from <InlineCode code="test" /> or
        use the CLI to deploy. <Link href="#">Learn more</Link>
    </span>
    <Layout.Stack direction="row" gap="m" wrap="wrap"></Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s">Next</Button>
    </svelte:fragment>
</Modal>
