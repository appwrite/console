<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { InputId } from '$lib/elements/forms';
    import { InputProjectId } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { Card, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    export let show = false;
    export let name: string;
    export let id: string;
    export let autofocus = true;
    export let isProject = false;
    $: if (!show) {
        id = null;
    }

    $: if (!id?.length) {
        id = null;
    }

    $: if (show) {
        trackEvent(Click.ShowCustomIdClick);
    }
</script>

{#if show}
    <Card.Base
        variant="secondary"
        padding="s"
        --input-background-color="var(--bgcolor-neutral-primary)">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Layout.Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography.Text variant="m-600">{name} ID</Typography.Text>
                    <Button extraCompact on:click={() => (show = false)}>
                        <Icon icon={IconX} size="s" />
                    </Button>
                </Layout.Stack>
                <Typography.Text>
                    Enter a custom {name} ID. Leave blank for a randomly generated one.
                </Typography.Text>
            </Layout.Stack>
            <span
                style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;">
                <Divider />
            </span>
            {#if isProject}
                <InputProjectId bind:value={id} {autofocus} />
            {:else}
                <InputId required bind:value={id} {autofocus} />
            {/if}
        </Layout.Stack>
    </Card.Base>
{/if}
