<script lang="ts">
    import { Modal } from '$lib/components';
    import Code from '$lib/components/code.svelte';
    import Tab from '$lib/components/tab.svelte';
    import Tabs from '$lib/components/tabs.svelte';
    import { Button } from '$lib/elements/forms';

    export let showSnippet = false;
    export let variableKey: string;

    // TODO: @Meldiron Finish or delete this component

    enum Language {
        NodeJS,
        Python,
        Dart,
        Ruby,
        Java
    }
    let language: Language = Language.NodeJS;
</script>

<Modal bind:show={showSnippet} size="big">
    <svelte:fragment slot="header">Code Snippet</svelte:fragment>
    <p>Snippet of a code showing how to read environment variables in Appwrite Functions.</p>
    <Tabs>
        <Tab on:click={() => (language = Language.NodeJS)} selected={language === Language.NodeJS}>
            Node.JS
        </Tab>
        <Tab on:click={() => (language = Language.Python)} selected={language === Language.Python}>
            Python
        </Tab>
        <Tab on:click={() => (language = Language.Dart)} selected={language === Language.Dart}>
            Dart
        </Tab>
        <Tab on:click={() => (language = Language.Ruby)} selected={language === Language.Ruby}>
            Ruby
        </Tab>
        <Tab on:click={() => (language = Language.Java)} selected={language === Language.Java}>
            Java
        </Tab>
    </Tabs>

    {#if language === Language.NodeJS}
        <Code
            withLineNumbers
            withCopy
            language="js"
            label="JavaScript"
            code={`process.env['${variableKey}']`} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showSnippet = false)}>Close</Button>
    </svelte:fragment>
</Modal>
