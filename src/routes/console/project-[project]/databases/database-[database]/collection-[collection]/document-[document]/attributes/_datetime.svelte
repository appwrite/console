<script lang="ts">
    import { InputDateTime } from '$lib/elements/forms';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeDatetime;
</script>

<InputDateTime {id} {label} showLabel={!!label?.length} required={attribute.required} bind:value />
