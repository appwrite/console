<script lang="ts">
    import { versions } from '../store';

    import { Code } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';

    enum Method {
        NPM,
        CDN
    }

    let method: Method = Method.NPM;

    const example1 = `import { Client } from 'appwrite';`;
    const example2 =
        `<script src="https://cdn.jsdelivr.net/npm/appwrite@${$versions['client-web']}" />
<script>
    const { Client } = Appwrite;
</script` + `>`; // Prevent svelte from processing the closing script tag
</script>

<WizardStep>
    <svelte:fragment slot="title">Get the SDK</svelte:fragment>

    <p>Choose your preferred method of installation</p>
    <div class="u-flex u-gap-16 u-margin-block-start-8">
        <Pill button on:click={() => (method = Method.NPM)} selected={method === Method.NPM}>
            NPM
        </Pill>
        <Pill button on:click={() => (method = Method.CDN)} selected={method === Method.CDN}>
            CDN
        </Pill>
    </div>

    <div class="u-margin-block-start-32">
        {#if method === Method.NPM}
            <p>
                Use
                <a href="https://npmjs.org" target="_blank" rel="noopener noreferrer" class="link"
                    >NPM (node package manager)</a> from your command line to add Appwrite SDK to your
                project.
            </p>
            <div class="u-margin-block-start-16">
                <Code label="Bash" language="sh" code="npm install appwrite" withCopy noMargin />
            </div>
            <p class="common-section">
                When you're using a bundler (like <a
                    href="https://vitejs.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">Vite</a>
                or
                <a
                    href="https://rollupjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">Rollup</a
                >), import the Appwrite module when you need it:
            </p>
            <div class="u-margin-block-start-16">
                <Code
                    label="Web SDK"
                    labelIcon="code"
                    language="js"
                    code={example1}
                    withCopy
                    noMargin />
            </div>
        {:else if method === Method.CDN}
            <p>
                To install with a CDN (content delivery network) add the following scripts to the
                bottom of your tag, but before you use any Appwrite services:
            </p>
            <div class="u-margin-block-start-16">
                <Code label="HTML" language="html" code={example2} withCopy noMargin />
            </div>
        {/if}
    </div>
</WizardStep>
