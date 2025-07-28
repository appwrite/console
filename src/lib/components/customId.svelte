<script lang="ts">
    import { InputId } from '$lib/elements/forms';
    import { InputProjectId } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Card, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        name,
        id = $bindable(null),
        autofocus = true,
        isProject = false,
        required = true
    }: {
        show: boolean;
        name: string;
        id: string;
        autofocus?: boolean;
        isProject?: boolean;
        required?: boolean;
    } = $props();

    $effect(() => {
        if (!show) {
            id = null;
        }

        if (!id?.length) {
            id = null;
        }

        if (show) {
            trackEvent(Click.ShowCustomIdClick);
        }
    });
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
                <InputProjectId on:input bind:value={id} {autofocus} />
            {:else}
                <InputId {required} on:input bind:value={id} {autofocus} />
            {/if}
        </Layout.Stack>
    </Card.Base>
{/if}
