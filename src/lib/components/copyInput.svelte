<script lang="ts">
    import { Copy } from '.';
    import { Input, Layout } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';

    export let value: string;
    export let label: string = null;
    export let optionalText: string | undefined = undefined;
</script>

<Input.Text readonly {value} {label} helper={optionalText} required>
    <Copy {value} slot="end">
        <Layout.Stack>
            <Input.Action icon={IconDuplicate} />
        </Layout.Stack>
    </Copy>
</Input.Text>
