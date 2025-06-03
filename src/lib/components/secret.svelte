<script lang="ts">
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Copy } from '.';
    import { Input } from '@appwrite.io/pink-svelte';

    export let value: string;
    export let copyEvent: string = null;
    export let label: string = undefined;
</script>

<Input.Password {value} {label} required>
    <svelte:fragment slot="end">
        <Copy {value} event={copyEvent} eventContext="click_secret_copy">
            <Input.Action icon={IconDuplicate} />
        </Copy>
    </svelte:fragment>
</Input.Password>
