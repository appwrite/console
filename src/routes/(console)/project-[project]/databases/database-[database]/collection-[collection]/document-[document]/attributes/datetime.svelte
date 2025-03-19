<script lang="ts">
    import { InputDateTime } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeDatetime;
    export let optionalText: string | undefined = undefined;
</script>

<InputDateTime
    {id}
    {label}
    required={attribute.required}
    nullable={!attribute.required}
    bind:value />
