<script lang="ts">
    import { ProjectOAuth2GooglePrompt } from '@appwrite.io/console';
    import { Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let value: ProjectOAuth2GooglePrompt[] = [];

    const dispatch = createEventDispatcher<{ change: ProjectOAuth2GooglePrompt[] }>();

    const options: { val: ProjectOAuth2GooglePrompt; label: string }[] = [
        { val: ProjectOAuth2GooglePrompt.None, label: 'None' },
        { val: ProjectOAuth2GooglePrompt.Consent, label: 'Consent' },
        { val: ProjectOAuth2GooglePrompt.SelectAccount, label: 'Select account' }
    ];

    function toggle(opt: ProjectOAuth2GooglePrompt): void {
        let next: ProjectOAuth2GooglePrompt[];
        if (opt === ProjectOAuth2GooglePrompt.None) {
            next = value.includes(opt) ? [] : [opt];
        } else {
            next = value.includes(opt)
                ? value.filter((v) => v !== opt)
                : [...value.filter((v) => v !== ProjectOAuth2GooglePrompt.None), opt];
        }
        value = next;
        dispatch('change', next);
    }
</script>

<Layout.Stack gap="xs">
    <Typography.Text variant="m-500">Prompt</Typography.Text>
    <Layout.Stack direction="row" gap="s" flexWrap="wrap">
        {#each options as option (option.val)}
            <Tag
                size="s"
                selected={value.includes(option.val)}
                on:click={() => toggle(option.val)}>
                {option.label}
            </Tag>
        {/each}
    </Layout.Stack>
</Layout.Stack>
