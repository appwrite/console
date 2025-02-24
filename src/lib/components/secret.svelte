<script lang="ts">
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Copy } from '.';
    import { Input } from '@appwrite.io/pink-svelte';

    export let value: string;
    export let copyEvent: string = null;
</script>

<Input.Password {value}>
    <div slot="end">
        <Copy {value} event={copyEvent} eventContext="click_secret_copy">
            <Input.Action icon={IconDuplicate} />
        </Copy>
    </div>
</Input.Password>
