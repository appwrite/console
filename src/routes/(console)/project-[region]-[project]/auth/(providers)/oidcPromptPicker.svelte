<script lang="ts">
    import { ProjectOAuth2OidcPrompt } from '@appwrite.io/console';
    import { Layout, Tag, Typography } from '@appwrite.io/pink-svelte';

    type Props = {
        value: ProjectOAuth2OidcPrompt[];
        onchange?: (value: ProjectOAuth2OidcPrompt[]) => void;
    };

    let { value = $bindable([]), onchange }: Props = $props();

    const options: { val: ProjectOAuth2OidcPrompt; label: string }[] = [
        { val: ProjectOAuth2OidcPrompt.None, label: 'None' },
        { val: ProjectOAuth2OidcPrompt.Login, label: 'Login' },
        { val: ProjectOAuth2OidcPrompt.Consent, label: 'Consent' },
        { val: ProjectOAuth2OidcPrompt.SelectAccount, label: 'Select account' }
    ];

    function toggle(opt: ProjectOAuth2OidcPrompt): void {
        let next: ProjectOAuth2OidcPrompt[];
        if (opt === ProjectOAuth2OidcPrompt.None) {
            next = value.includes(opt) ? [] : [opt];
        } else {
            next = value.includes(opt)
                ? value.filter((v) => v !== opt)
                : [...value.filter((v) => v !== ProjectOAuth2OidcPrompt.None), opt];
        }
        value = next;
        onchange?.(next);
    }
</script>

<Layout.Stack gap="xs">
    <Typography.Text variant="m-500">Prompt</Typography.Text>
    <Layout.Stack direction="row" gap="s" flexWrap="wrap">
        {#each options as option (option.val)}
            <Tag size="s" selected={value.includes(option.val)} onclick={() => toggle(option.val)}>
                {option.label}
            </Tag>
        {/each}
    </Layout.Stack>
</Layout.Stack>
