<script lang="ts">
    import { EyebrowHeading } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    import { WizardStep } from '$lib/layout';
</script>

<WizardStep>
    <svelte:fragment slot="title">Select data</svelte:fragment>
    <div class="box" style:border-radius="0.5rem">
        <div class="u-flex u-flex-vertical u-gap-16">
            <EyebrowHeading class="eyebrow" tag="h3" size={3}>Good to know</EyebrowHeading>
            <div class="u-flex u-gap-16">
                <div class="circled">
                    <i class="icon-cog" />
                </div>
                <div>
                    <p class="u-bold">Project settings are not imported</p>
                    <p>You will need to set service and project settings manually</p>
                </div>
            </div>
            <div class="u-flex u-gap-16">
                <div class="circled">
                    <i class="icon-trending-up" />
                </div>
                <div>
                    <p class="u-bold">Keep your project plan limits in mind</p>
                    <p>
                        Make sure to have enough storage in your project plan when importing files
                    </p>
                </div>
            </div>
            <div class="u-flex u-gap-16">
                <div class="circled">
                    <i class="icon-currency-dollar" />
                </div>
                <div>
                    <p class="u-bold">Transfer is free of charge</p>
                    <p>You won’t be charged for Appwrite bandwidth usage for importing data</p>
                </div>
            </div>
        </div>
    </div>

    <ul class="buttons-list u-margin-block-start-32 u-main-end">
        <li class="buttons-list-item">
            <Button text>Deselect all</Button>
        </li>

        <li class="buttons-list-item">
            <Button text>Select all</Button>
        </li>
    </ul>

    <ul class="u-flex u-flex-vertical u-gap-32 u-margin-block-start-16">
        <li class="checkbox-field">
            <input type="checkbox" />
            <div class="u-flex u-gap-4">
                <span class="u-bold">Users</span>
                <span class="inline-tag">300</span>
            </div>
            <div />
            <span>Import all users</span>

            <ul>
                <li class="checkbox-field">
                    <input type="checkbox" />
                    <div class="u-flex u-gap-4">
                        <span class="u-bold">Include teams</span>
                        <span class="inline-tag">4</span>
                    </div>
                    <div />
                    <span>Import all teams and the team memberships of your users</span>
                </li>
            </ul>
        </li>
        <li class="checkbox-field">
            <input type="checkbox" />
            <div class="u-flex u-gap-4">
                <span class="u-bold">Databases</span>
                <span class="inline-tag">300</span>
            </div>
            <div />
            <span>Import all databases, including collections, indexes and attributes</span>

            <ul>
                <li class="checkbox-field">
                    <input type="checkbox" />
                    <div class="u-flex u-gap-4">
                        <span class="u-bold">Include documents</span>
                        <span class="inline-tag">4</span>
                    </div>
                    <div />
                    <span>Import all of your documents</span>
                </li>
            </ul>
        </li>
        <li class="checkbox-field">
            <input type="checkbox" />
            <div class="u-flex u-gap-4">
                <span class="u-bold">Functions</span>
                <span class="inline-tag">30</span>
            </div>
            <div />
            <span>Import all functions and their active deployment</span>
            <ul>
                <li class="checkbox-field">
                    <input type="checkbox" />
                    <div class="u-flex u-gap-4">
                        <span class="u-bold">Include environment variables</span>
                    </div>
                    <div />
                    <span>Description here</span>
                </li>
                <li class="checkbox-field">
                    <input type="checkbox" />
                    <div class="u-flex u-gap-4">
                        <span class="u-bold">Include inactive deployments</span>
                    </div>
                    <div />
                    <span>Description here</span>
                </li>
            </ul>
        </li>
        <li class="checkbox-field">
            <input type="checkbox" />
            <div class="u-flex u-gap-4">
                <span class="u-bold">Storage</span>
                <span class="inline-tag">30GB</span>
            </div>
            <div />
            <span>Import all buckets (2) and files (3000)</span>
        </li>
    </ul>
</WizardStep>

<style lang="scss">
    .box :global(.eyebrow) {
        font-weight: 500;
        color: hsl(var(--color-neutral-70));
    }

    .circled {
        width: 1.5rem;
        height: 1.5rem;
        flex-shrink: 0;
        border-radius: 100%;
        border: 1px solid hsl(var(--color-border));
        position: relative;

        i {
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
            font-size: 1rem;
        }
    }

    .buttons-list {
        border-block-end: 1px solid hsl(var(--color-border));
        padding-block-end: 0.625rem;
    }

    .checkbox-field {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.25rem 1rem;
        align-items: center;

        ul {
            grid-column-start: 2;
            padding-block-end: 2rem;

            li {
                margin-block-start: 1rem;
            }
        }
    }
</style>
