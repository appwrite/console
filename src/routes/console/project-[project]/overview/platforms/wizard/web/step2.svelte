<script lang="ts">
    import { versions } from '../store';
    import { Code } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import LL from '$i18n/i18n-svelte';

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
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.getSdk()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.forms.overview.texts.chooseMethod()}
        <div class="u-flex u-gap-16 u-margin-block-start-8">
            <Pill button on:click={() => (method = Method.NPM)} selected={method === Method.NPM}>
                NPM
            </Pill>
            <Pill button on:click={() => (method = Method.CDN)} selected={method === Method.CDN}>
                CDN
            </Pill>
        </div>
    </svelte:fragment>
    {#if method === Method.NPM}
        <p>
            {$LL.console.project.forms.overview.texts.use()}
            <a href="https://npmjs.org" target="_blank" rel="noopener noreferrer" class="link"
                >NPM (node package manager)</a>
            {$LL.console.project.forms.overview.texts.cmdLine()}
        </p>
        <Code label="Bash" language="sh" code="npm install appwrite" withCopy />
        <p class="common-section">
            {$LL.console.project.forms.overview.texts.note.phraseOne()}
            <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" class="link"
                >Vite</a>
            {$LL.console.project.forms.overview.texts.note.or()}
            <a href="https://rollupjs.org" target="_blank" rel="noopener noreferrer" class="link"
                >Rollup</a
            >{$LL.console.project.forms.overview.texts.note.phraseTwo()}
        </p>
        <Code label="Web SDK" labelIcon="code" language="js" code={example1} withCopy />
    {:else if method === Method.CDN}
        <p>
            {$LL.console.project.forms.overview.texts.installWithCdn()}
        </p>
        <Code label="HTML" language="html" code={example2} withCopy />
    {/if}
</WizardStep>
