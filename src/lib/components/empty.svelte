<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Empty, Card, Layout, Avatar, Icon, Typography } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { consoleProfile, isStudio } from '$lib/system';
    import { showChat, showPrompt } from '$lib/stores/chat';

    export let single = false;
    export let target: string = null;
    export let href: string = null;
    export let allowCreate = true;
    export let description = 'Need a hand? Learn more in our documentation.';
    export let disabled = false;
    export let src: string = null;
    export let prompt: string = null;

    function track() {
        if (!allowCreate) {
            return;
        }
        if (target) {
            trackEvent(`click_create_${target}`, {
                from: 'empty'
            });
        }
    }
</script>

{#if single}
    <Card.Base padding="none">
        <Empty title={`Create your first ${target}`} {description} {src}>
            <slot name="actions" slot="actions">
                {#if consoleProfile.hasChat && prompt}
                    <Button
                        text
                        size="s"
                        on:click={() => {
                            showChat.set(true);
                            showPrompt.set(true);
                        }}>Ask help</Button>
                {:else}<Button
                        external
                        {href}
                        text
                        event="empty_documentation"
                        size="s"
                        ariaLabel="create {target}">Documentation</Button>
                {/if}
                <Button
                    secondary
                    on:mousedown
                    on:click
                    on:click={track}
                    disabled={!allowCreate}
                    size="s">
                    Create {target}
                </Button>
            </slot>
        </Empty>
    </Card.Base>
{:else}
    <Card.Button on:click on:click={track} aria-label="create" {disabled}>
        <Layout.Stack justifyContent="center" alignItems="center" gap="m">
            <Avatar size="s"><Icon icon={IconPlus} size="s" /></Avatar>
            <Typography.Text variation="m-400" align="center"><slot /></Typography.Text>
        </Layout.Stack>
    </Card.Button>
{/if}
