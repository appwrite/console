<script lang="ts">
    import { getHasSurveyedFromPrefs, saveHasSurveyed } from '$lib/helpers/studioLayout';
    import { Button, Layout, Tag } from '@appwrite.io/pink-svelte';
    import Modal from '../modal.svelte';

    let show = $derived(getHasSurveyedFromPrefs() ? true : false);

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

    const handleSubmit = () => {
        alert(`role is ${role}`);
        saveHasSurveyed();
        show = false;
    };
</script>

<Modal bind:show title="What is your role?">
    <Layout.Stack direction="row" gap="m" wrap="wrap">
        {#each roles as r}
            {@const isActive = role === r}
            <Tag
                onclick={() => (role = r)}
                class={isActive ? 'active' : ''}
                variant="default"
                selected={isActive}>
                {r}
            </Tag>
        {/each}
    </Layout.Stack>

    <Button.Button onclick={handleSubmit}>Submit</Button.Button>
</Modal>

<style>
</style>
