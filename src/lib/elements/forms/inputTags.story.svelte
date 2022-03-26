<script lang="ts" context="module">
    import type { PageMeta } from '@vitebook/client';

    export const __pageMeta: PageMeta = {
        title: 'Input Tags',
        description: 'My awesome input tags.'
    };
</script>

<script>
    import { ControlsAddon } from '@vitebook/client/addons';
    import { InputText, InputTags } from '.';

    let label = 'Permissions';
    let tags = ['role:all'];
</script>

<InputTags id="label" {label} bind:tags />

<ControlsAddon>
    <InputText id="label" label="Label" bind:value={label} />
</ControlsAddon>
