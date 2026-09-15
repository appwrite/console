<script lang="ts">
    import { Button, Icon, Input, Layout, Tag } from '@appwrite.io/pink-svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';

    let {
        elements = $bindable<string[]>([]),
        disabled = false
    }: { elements?: string[]; disabled?: boolean } = $props();

    let value = $state('');

    function add() {
        if (disabled || !value) return;
        if (!elements.includes(value)) elements = [...elements, value];
        value = '';
    }

    function keydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            add();
        }
    }
</script>

<Layout.Stack gap="s">
    <Input.Text
        id="elements"
        label="Elements"
        placeholder="Add an element"
        helper="Press Enter or choose Add to add a value. Elements can contain spaces."
        required={!elements.length}
        {disabled}
        bind:value
        onkeydown={keydown}>
        <Button.Button slot="end" type="button" variant="text" {disabled} on:click={add}>
            Add
        </Button.Button>
    </Input.Text>
    <Layout.Stack direction="row" wrap="wrap" gap="s">
        {#each elements as element, index}
            <Tag
                size="s"
                {disabled}
                aria-label={`Remove ${element}`}
                on:click={() => (elements = elements.filter((_, position) => position !== index))}>
                {element}
                <Icon slot="end" icon={IconX} size="s" />
            </Tag>
        {/each}
    </Layout.Stack>
</Layout.Stack>
