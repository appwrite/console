<script lang="ts">
    import { measure } from '$lib/helpers/measure.svelte';
    import {
        Button,
        Popover,
        Divider,
        Layout,
        Status,
        Link,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';

    let height = $state(130);
    let publishing = $state(false);
    let published = $state(false);

    const releaseDate = new Date('2025-07-15T12:00:00Z');

    const daysSinceRelease = $derived.by(() => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - releaseDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    const getHeight = () => {
        switch (publishing) {
            case true:
                height = 46;
                break;
            case false:
                height = 130;
                break;
            default:
                return 130; // Default height
        }
    };

    const handlePublish = () => {
        publishing = true;
        getHeight();

        setTimeout(() => {
            published = true;
            publishing = false;
            getHeight();
        }, 4000);
    };
</script>

<Popover let:toggle padding="none" placement="bottom-end">
    <Button.Button
        size="s"
        variant="primary"
        onclick={(e) => {
            toggle(e);
        }}
        >Release
    </Button.Button>
    <svelte:fragment slot="tooltip">
        <div class="popover" style:width="284px" style:--height={`${height}px`}>
            {#if !publishing}
                <Layout.Stack direction="column" gap="none">
                    <div class="popover-section">
                        <Layout.Stack direction="column" gap="s">
                            <Link.Anchor variant="quiet" href="/" icon
                                >s-1309123843s9399...imagine.dev</Link.Anchor>
                            <Status
                                label={published
                                    ? `Released ${daysSinceRelease} days ago`
                                    : 'Not published'}
                                status={published ? 'complete' : 'waiting'} />
                        </Layout.Stack>
                    </div>

                    <Divider />
                    <Layout.Stack
                        direction="row"
                        class="popover-section"
                        gap="s"
                        justifyContent="flex-end">
                        <Button.Button
                            size="s"
                            variant="secondary"
                            onclick={() => alert('connect clicked')}>Connect domain</Button.Button>
                        <Button.Button size="s" onclick={handlePublish}>Deploy</Button.Button>
                    </Layout.Stack>
                </Layout.Stack>
            {:else}
                <div class="popover-section">
                    <Layout.Stack
                        direction="row"
                        gap="m"
                        justifyContent="space-between"
                        alignItems="center">
                        <Typography.Text
                            class="status-text"
                            variant="m-500"
                            color="var(--fgcolor-neutral-secondary)">
                            Releasing...</Typography.Text>
                        <Spinner size="s" />
                    </Layout.Stack>
                </div>
            {/if}
        </div>
    </svelte:fragment>
</Popover>

<style>
    :global(.popover-section) {
        padding: var(--space-6);
        width: 100%;
    }

    .popover {
        height: var(--height);
        transition: all ease-out 0.25s;
    }
</style>
