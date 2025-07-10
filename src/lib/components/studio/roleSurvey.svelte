<script lang="ts">
    import { getHasSurveyedFromPrefs, saveHasSurveyed } from '$lib/helpers/studioLayout';
    import { Button, Layout } from '@appwrite.io/pink-svelte';
    import Modal from '../modal.svelte';

    let show = $derived(!getHasSurveyedFromPrefs() ? true : false);

    const roles = [
        'Developer',
        'Product Manager',
        'Founder',
        'Content Creator',
        'Designer',
        'Marketer',
        'Student',
        'Educator',
        'Hobbyist/Personal Use',
        'Other'
    ] as const;

    let role = $state<(typeof roles)[number]>('Developer');
</script>

<Modal bind:show title="What is your role?">
    <Layout.Stack direction="row" gap="m" wrap="wrap">
        {#each roles as r}
            <Button.Button onclick={() => (role = r)} variant="secondary">
                {r}
            </Button.Button>
        {/each}
    </Layout.Stack>

    <Button.Button onclick={() => saveHasSurveyed()}>Submit</Button.Button>
</Modal>
