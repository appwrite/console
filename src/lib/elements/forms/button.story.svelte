<script lang="ts" context="module">
    import type { PageMeta } from '@vitebook/client';

    export const __pageMeta: PageMeta = {
        title: 'Button',
        description: 'My awesome button.'
    };
</script>

<script>
    import { Variant } from '@vitebook/client';
    import { ControlsAddon, EventsAddon, eventCallback } from '@vitebook/client/addons';
    import { InputText, InputSwitch, Button } from '.';

    let title = 'Click Me';
    let disabled = false;
</script>

<Variant name="Default" description="The default button.">
    <Button {disabled} on:click={eventCallback}>{title}</Button>
</Variant>

<Variant name="Secondary" description="The secondary button.">
    <Button {disabled} secondary on:click={eventCallback}>{title}</Button>
</Variant>

<Variant name="Outline" description="The outline button.">
    <Button {disabled} outline on:click={eventCallback}>{title}</Button>
</Variant>

<ControlsAddon>
    <InputText id="title" label="Title" bind:value={title} />
    <InputSwitch id="disabled" label="Disabled" bind:value={disabled} />
</ControlsAddon>

<EventsAddon />
