<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { templateConfig } from '../store';

    async function beforeSubmit() {
        if (!$templateConfig.repositoryBehaviour) {
            throw new Error('Please select repository behaviour.');
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Repository behaviour</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Connect function to a new repository or to an existing one within a selected Git
        organization.
    </svelte:fragment>

    <ul class="u-flex u-flex-vertical u-gap-24">
        <li>
            <label
                class="card is-allow-focus u-cursor-pointer"
                style="--card-padding:1rem; --card-border-radius:var(--border-radius-small);">
                <div class="u-flex u-gap-16">
                    <input
                        bind:group={$templateConfig.repositoryBehaviour}
                        class="is-small u-margin-block-start-2"
                        value="new"
                        type="radio"
                        name="repositoryBehaviour" />
                    <div class="u-flex u-flex-vertical u-gap-4">
                        <h4 class="body-text-2 u-bold">Create new repository</h4>
                        <p class="u-color-text-gray">
                            Clone the template and create a new repository in your selected
                            organization.
                        </p>
                    </div>
                </div>
            </label>
        </li>
        <li>
            <label
                class="card is-allow-focus u-cursor-pointer"
                style="--card-padding:1rem; --card-border-radius:var(--border-radius-small);">
                <div class="u-flex u-gap-16">
                    <input
                        bind:group={$templateConfig.repositoryBehaviour}
                        class="is-small u-margin-block-start-2"
                        value="existing"
                        type="radio"
                        name="repositoryBehaviour" />
                    <div class="u-flex u-flex-vertical u-gap-4">
                        <h4 class="body-text-2 u-bold">Add to existing repository</h4>
                        <p class="u-color-text-gray">
                            Clone the template to an existing repository in your selected
                            organization.
                        </p>
                    </div>
                </div>
            </label>
        </li>
    </ul>
</WizardStep>
