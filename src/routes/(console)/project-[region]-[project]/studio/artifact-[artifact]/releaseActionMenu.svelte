<script lang="ts">
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

    type Dimension = number | null;

    const dimensions = $state<{
        height: Dimension;
        width: Dimension;
    }>({
        width: null,
        height: null
    });

    const handlePublish = () => {
        publishing = true;

        setTimeout(() => {
            published = true;
            publishing = false;
        }, 4000);
    };

    $inspect(dimensions);
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
        <div class="popover" style:width="284px" style:--height={`${dimensions.height}px`}>
            <div bind:clientHeight={dimensions.height}>
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
                                onclick={() => alert('connect clicked')}
                                >Connect domain</Button.Button>
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
