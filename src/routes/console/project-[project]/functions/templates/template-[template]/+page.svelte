<script lang="ts">
    import { base } from '$app/paths';
    import { Alert, Card, Collapsible, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { isSelfHosted } from '$lib/system';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';
    import { afterUpdate, onMount } from 'svelte';
    import { consoleVariables, isVcsEnabled } from '$routes/console/store';
    import { template } from './store';

    let html = '';
    let container: HTMLDivElement;
    onMount(async () => {
        html = await fetchReadme();
    });

    afterUpdate(() => {
        container.querySelectorAll('.anchor')?.forEach((e) => {
            e.classList.add('u-hide');
        });
        container.querySelectorAll('h1').forEach((e) => {
            e.classList.add('heading-level-4', 'common-section');
        });
        container.querySelectorAll('h2').forEach((e) => {
            e.classList.add('heading-level-5', 'u-margin-block-start-16');
        });
        container.querySelectorAll('h3').forEach((e) => {
            e.classList.add('heading-level-6', 'u-margin-block-start-16');
        });
        container.querySelectorAll('h4').forEach((e) => {
            e.classList.add('heading-level-7', 'u-margin-block-start-8');
        });
        container.querySelectorAll('p').forEach((e) => {
            e.classList.add('u-margin-block-start-8');
        });
        container.querySelectorAll('ul').forEach((e) => {
            e.classList.add('u-margin-block-start-8', 'list');
        });
        container.querySelectorAll('li').forEach((e) => {
            e.classList.add('list-item');
        });
        container.querySelectorAll('strong').forEach((e) => {
            e.classList.add('u-bold');
        });

        container.querySelectorAll('.snippet-clipboard-content').forEach((e) => {
            e.classList.add('box', 'u-margin-block-start-8', 'u-min-width-0');
        });
        container.querySelectorAll('.highlight').forEach((e) => {
            e.classList.add('box', 'u-margin-block-start-8', 'u-min-width-0');
        });
        const table = container.querySelectorAll('table');

        table.forEach((e) => {
            e.classList.add('table');

            const div1 = document.createElement('div');
            const div2 = document.createElement('div');
            div1.classList.add('table-with-scroll', 'u-margin-block-start-16');
            div2.classList.add('table-wrapper');
            e.parentNode.insertBefore(div1, e);
            e.parentNode.insertBefore(div2, e.nextSibling);
            div1.appendChild(div2);
            div2.appendChild(e);
        });

        container.querySelectorAll('thead').forEach((e) => {
            e.classList.add('table-thead');
        });
        container.querySelectorAll('tbody').forEach((e) => {
            e.classList.add('table-tbody');
        });
        container.querySelectorAll('th').forEach((e) => {
            e.classList.add('table-thead-col', 'eyebrow-heading-3');
            e.style.cssText = '--p-col-width: 70;';
        });
        container.querySelectorAll('tr').forEach((e) => {
            e.classList.add('table-row');
        });
        container.querySelectorAll('td').forEach((e) => {
            e.classList.add('table-col');
            e.style.cssText = '--p-col-width: 70;';
        });
        container.querySelectorAll('code:not(pre code)').forEach((e) => {
            e.classList.add('inline-code');
        });
    });

    async function fetchReadme() {
        const runtime = $template.runtimes[0];
        const url = `https://api.github.com/repos/${$template.providerOwner}/${$template.providerRepositoryId}/contents/${runtime.providerRootDirectory}/README.md`;

        const response = await fetch(url, {
            headers: {
                Accept: 'application/vnd.github.html'
            }
        });

        const readmeHTML = await response.text();
        return readmeHTML;
    }
</script>

<Container>
    <div class="grid-300px-1fr">
        <section>
            <Collapsible>
                <li class="collapsible-item">
                    <h3 class="body-text-2 u-bold u-padding-block-12">
                        Use cases <span class="inline-tag">{$template.usecases.length}</span>
                    </h3>
                    <div class="collapsible-content u-flex u-flex-wrap u-gap-8">
                        {#each $template.usecases as useCase}
                            <Pill>{useCase}</Pill>
                        {/each}
                    </div>
                </li>
                <li class="collapsible-item">
                    <h3 class="body-text-2 u-bold u-padding-block-12">
                        Runtimes <span class="inline-tag">{$template.runtimes.length}</span>
                    </h3>
                    <div class="collapsible-content u-flex u-flex-wrap u-gap-8">
                        {#each $template.runtimes as runtime}
                            <Pill>{runtime.name}</Pill>
                        {/each}
                    </div>
                </li>
                <li class="collapsible-item">
                    <section class="card u-margin-block-start-24">
                        <h4 class="body-text-1 u-bold">Published by</h4>
                        <img
                            class="u-margin-block-start-8"
                            width="130"
                            src={`${base}/logos/appwrite-full.svg`}
                            alt="" />
                    </section>
                </li>
            </Collapsible>
        </section>
        <section>
            <Card>
                <Heading size="7" tag="h3">
                    <span class="u-flex u-cross-center u-gap-8">
                        <div class="avatar is-size-small">
                            <span
                                style:--p-text-size="20px"
                                class={$template.icon}
                                aria-hidden="true" />
                        </div>
                        {$template.name}
                    </span>
                </Heading>
                <p class="u-margin-block-start-24">{$template.tagline}</p>
                {#if isSelfHosted && !isVcsEnabled($consoleVariables)}
                    <Alert class="u-margin-block-start-24" type="info">
                        <svelte:fragment slot="title">
                            Cloning templates to a self-hosted instance
                        </svelte:fragment>
                        In order to clone a template to a locally hosted Appwrite project, you must set
                        up a Git integration and configure your environment variables.
                        <svelte:fragment slot="buttons">
                            <Button href="https://appwrite.io/docs/configuration#git" external text>
                                Learn more
                            </Button>
                        </svelte:fragment>
                    </Alert>
                {/if}
                <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24 u-flex-wrap">
                    <Button
                        text
                        href={`https://github.com/${$template.providerOwner}/${$template.providerRepositoryId}`}
                        external>
                        View source
                        <span class="icon-external-link" />
                    </Button>
                    <Button
                        disabled={isSelfHosted && !isVcsEnabled}
                        on:click={() => connectTemplate($template)}>
                        Create function
                    </Button>
                </div>
            </Card>
            <Card>{@html $template.instructions}</Card>
            <Card>
                <div bind:this={container}>
                    {@html html}
                </div>
            </Card>
        </section>
    </div>
</Container>
