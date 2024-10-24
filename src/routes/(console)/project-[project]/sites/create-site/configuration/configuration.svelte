<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import { InputSelect } from '$lib/elements/forms';
    import { Fieldset, Layout, Tag } from '@appwrite.io/pink-svelte';

    export let source: 'custom' | 'template' = 'custom';
    export let framework = '';

    const FRAMEWORKS_AVAILABLE = [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'angular', label: 'Angular' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'static', label: 'Static' }
    ];
</script>

<Fieldset legend="Details">
    <Layout.Stack gap="l">
        {#if source === 'custom'}
            <InputSelect
                id="framework"
                label="Framework"
                placeholder="Select framework"
                bind:value={framework}
                options={FRAMEWORKS_AVAILABLE} />
        {/if}

        <Collapsible>
            {#if source === 'custom'}
                <CollapsibleItem>
                    <svelte:fragment slot="title">
                        Build settings <Tag size="small">Optional</Tag>
                    </svelte:fragment>
                    Set up how your project is built and where the output files are stored.
                </CollapsibleItem>
            {/if}
            <CollapsibleItem>
                <svelte:fragment slot="title">Required environment variables</svelte:fragment>
                Provide the values for the required environment variables to run this application.
            </CollapsibleItem>
            <CollapsibleItem>
                <svelte:fragment slot="title"
                    >Environment variables <Tag size="small">Optional</Tag></svelte:fragment>
                Set up environment variables to securely manage keys and settings for your project.
            </CollapsibleItem>
        </Collapsible>
    </Layout.Stack>
</Fieldset>
