<script lang="ts">
    import { Button, Icon, Input, Layout, Tag } from '@appwrite.io/pink-svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';

    let {
        elements = $bindable<string[]>([]),
        disabled = false
    }: { elements?: string[]; disabled?: boolean } = $props();

    let value = $state('');
    let error = $state('');

    function add() {
        if (disabled) return;
        const element = value.trim();
        if ([...element].length > 255) {
            error = 'Enum elements cannot exceed 255 characters.';
            return;
        }
        if (element && !elements.includes(element)) elements = [...elements, element];
        value = '';
        error = '';
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
        helper={error ||
            'Press Enter or choose Add to add a value. Maximum 255 characters per element.'}
        state={error ? 'error' : 'default'}
        pattern=".{(0, 255)}"
        required={!elements.length}
        {disabled}
        bind:value
        on:input={() => (error = '')}
        onkeydown={keydown}
        onblur={add}>
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
