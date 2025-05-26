<script lang="ts">
    import { Card, Icon, Input, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import Button from '$lib/elements/forms/button.svelte';

    export let id: string;
    export let show = false;
    export let name: string;
    export let autofocus = true;
    export let databaseId: string;

    let error = null;
    const pattern = String.raw`^[a-zA-Z0-9][a-zA-Z0-9._\-]*$`;

    $: if (!show) {
        id = null;
    }

    $: if (show) {
        trackEvent(Click.ShowCustomIdClick);
    }

    $: if (id === databaseId) {
        error = 'Database ID must be different from the one being restored.';
    } else {
        error = null;
    }
</script>

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
        <Input.Text
            id="id"
            placeholder="Enter ID"
            maxlength={36}
            {pattern}
            {autofocus}
            helper={error}
            state={error ? 'warning' : 'default'}
            autocomplete="off"
            type="text"
            class="input-text"
            bind:value={id} />

        <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
            <span class="text u-line-height-1-5">
                Allowed characters: alphanumeric, non-leading hyphen, underscore, period. Database
                ID must be different from the one being restored.
            </span>
        </div>
    </Layout.Stack>
</Card.Base>
