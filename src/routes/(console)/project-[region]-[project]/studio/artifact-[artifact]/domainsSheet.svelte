<script lang="ts">
    import { Sheet } from '@appwrite.io/pink-svelte';

    type Props = {
        open?: boolean;
    };

    const { open }: Props = $props();
</script>

<Sheet {open}>
    <div>Manage your domains here</div>
</Sheet>
