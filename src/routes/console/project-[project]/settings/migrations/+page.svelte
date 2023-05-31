<script lang="ts">
    import { Arrow, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { isSelfHosted } from '$lib/system';
    import { openImportWizard } from './(import)';

    // This will be better implemented when we have i18n
    const strings = {
        cloud: {
            import: 'Import data from other products or from a different Appwrite instance',
            export: {
                title: 'Export to self-hosted instance',
                description: 'Export data from your project to a self-hosted instance'
            }
        },
        selfHosted: {
            import: 'Import project data from Cloud to your self-hosted project. \
            Initiate the process of importing project data from the migrations settings of your Cloud project.',
            export: {
                title: 'Deploy to Cloud',
                description: 'Export data from your project to Appwrite Cloud'
            }
        }
    }[isSelfHosted ? 'selfHosted' : 'cloud'];
</script>

<Container>
    <Heading tag="h2" size="5">Migrations</Heading>
    <CardGrid>
        <Heading tag="h3" size="7">Import project data</Heading>
        <p class="text">
            {strings.import}
        </p>
        <svelte:fragment slot="aside">
            <div class="import-box">
                <ul class="avatars-group">
                    <li class="avatars-group-item">
                        <div class="avatar">
                            <img src="/logos/firebase.png" alt="Firebase" width="20" />
                        </div>
                    </li>

                    <li class="avatars-group-item">
                        <div class="avatar">
                            <img src="/logos/supabase.png" alt="Supabase" width="20" />
                        </div>
                    </li>

                    <li class="avatars-group-item">
                        <div class="avatar">
                            <img src="/logos/nhost.png" alt="nhost" width="20" />
                        </div>
                    </li>

                    <li class="avatars-group-item">
                        <div class="avatar">
                            <img src="/logos/appwrite.png" alt="Appwrite" width="18" />
                        </div>
                    </li>
                </ul>
                <div class="u-margin-block-start-8">
                    <Arrow direction="down" />
                </div>
                <div class="avatar u-margin-block-start-8" style="--size: {48 / 16}rem">
                    <span class="icon-cloud" />
                </div>
                <Button class="u-margin-block-start-20" secondary on:click={openImportWizard}>
                    Import data
                </Button>
            </div>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h3" size="7">{strings.export.title}</Heading>
        <p class="text">
            {strings.export.description}
        </p>
        <svelte:fragment slot="aside">
            <div class="import-box">
                <div class="u-flex u-cross-center u-gap-8">
                    {#if isSelfHosted}
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-server" />
                        </div>
                        <Arrow direction="right" />
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-cloud" />
                        </div>
                    {:else}
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-cloud" />
                        </div>
                        <Arrow direction="right" />
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-server" />
                        </div>
                    {/if}
                </div>
                <Button class="u-margin-block-start-48" secondary>Export data</Button>
            </div>
        </svelte:fragment>
    </CardGrid>
</Container>

<style lang="scss">
    .import-box {
        display: grid;
        place-items: center;

        border: 1px dashed hsl(var(--color-border));
        /* border-color: red; */
        border-radius: 1rem;

        height: 100%;

        padding: 1.5rem;
    }
</style>
