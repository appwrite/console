<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { supportData } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Your message has been sent</svelte:fragment>
    <svelte:fragment slot="subtitle">The Appwrite team is on it!</svelte:fragment>

    {#if $supportData.category === 'technical'}
        <img
            src="https://i.kym-cdn.com/photos/images/newsfeed/001/485/098/245.gif"
            alt="Sweating guy" />

        <p class="text common-section">
            Thanks for the message! As you can see from this totally real video of an actual
            Appwrite employee, there is absolutely nothing wrong and we're not going to fire anyone.
        </p>
        <p class="text common-section">
            Just kidding! Dave the Intern is totally getting fired. Someone from the Appwrite team
            (not Dave) will be touch with you via email soon.
        </p>
    {:else}
        <img
            src="https://i.pinimg.com/originals/1c/3a/0d/1c3a0d8ce9c4a92344ae924ccda10149.gif"
            alt="Cat coding" />

        <p class="text common-section">
            Thanks for the message! As you can see from this totally real video of an actual
            Appwrite employee, the team is hard at work to address your comments and concerns.
        </p>
        <p class="text common-section">
            Sit tight, one of our ex-purrts will be in touch with you via email soon.
        </p>
    {/if}
</WizardStep>
