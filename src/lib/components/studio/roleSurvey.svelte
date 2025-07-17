<script lang="ts">
    import { getHasSurveyedFromPrefs, saveHasSurveyed } from '$lib/helpers/studioLayout';
    import { Button, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import Modal from '../modal.svelte';
    import { get } from 'svelte/store';
    import { user } from '$lib/stores/user';

    const hours = 24;
    let show = $derived(
        Date.now() - new Date(get(user).registration).getTime() >= hours * 60 * 60 * 1000 &&
            !getHasSurveyedFromPrefs()
    );

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
        console.log('surveyed');
        saveHasSurveyed();
        show = false;
    };
</script>

<Modal bind:show title="Tell us a little more about yourself">
    <Typography.Text variant="m-500" color="var(--fgcolor-neutral-primary)"
        >What is your role?</Typography.Text>
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

    <Button.Button size="s" slot="footer" onclick={handleSubmit}>Submit</Button.Button>
</Modal>

<style>
</style>
