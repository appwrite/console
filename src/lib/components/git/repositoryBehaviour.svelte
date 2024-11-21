<script lang="ts">
    import { InputRadio } from '$lib/elements/forms';

    import { Layout } from '@appwrite.io/pink-svelte';

    export let repositoryBehaviour: 'new' | 'existing' | undefined = undefined;
</script>

<Layout.Stack direction="row" gap="xl">
    <InputRadio
        size="s"
        label="Create new repository"
        bind:group={repositoryBehaviour}
        value="new"
        id="new"
        name="new" />
    <InputRadio
        size="s"
        label="Connect existing repository"
        bind:group={repositoryBehaviour}
        value="existing"
        id="existing"
        name="existing" />
</Layout.Stack>
