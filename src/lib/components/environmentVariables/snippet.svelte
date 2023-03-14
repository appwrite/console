<script lang="ts">
    import { Modal } from '$lib/components';
    import Code from '$lib/components/code.svelte';
    import Tab from '$lib/components/tab.svelte';
    import Tabs from '$lib/components/tabs.svelte';
    import { Button } from '$lib/elements/forms';

    export let showSnippet = false;
    export let variableKey: string;

    // TODO: @Meldiron finish this component

    enum Language {
        NodeJs,
        PHP,
        Python,
        Ruby,
        Deno,
        Dart,
        Kotlin,
        Swift
    }
    let language: Language = Language.NodeJs;
</script>

<Modal bind:show={showSnippet} size="big">
    <svelte:fragment slot="header">Code Snippet</svelte:fragment>
    <p>Snippet of a code showing how to read environment variables in Appwrite Functions.</p>
    <Tabs>
        <Tab on:click={() => (language = Language.NodeJs)} selected={language === Language.NodeJs}>
            Node.js
        </Tab>
        <Tab on:click={() => (language = Language.PHP)} selected={language === Language.PHP}>
            PHP
        </Tab>
        <Tab on:click={() => (language = Language.Python)} selected={language === Language.Python}>
            Python
        </Tab>
        <Tab on:click={() => (language = Language.Ruby)} selected={language === Language.Ruby}>
            Ruby
        </Tab>
        <Tab on:click={() => (language = Language.Deno)} selected={language === Language.Deno}>
            Deno
        </Tab>
        <Tab on:click={() => (language = Language.Dart)} selected={language === Language.Dart}>
            Dart
        </Tab>
        <Tab on:click={() => (language = Language.Kotlin)} selected={language === Language.Kotlin}>
            Kotlin
        </Tab>
        <Tab on:click={() => (language = Language.Swift)} selected={language === Language.Swift}>
            Swift
        </Tab>
    </Tabs>

    {#if language === Language.NodeJs}
        <Code withLineNumbers withCopy language="js" code={`process.env['${variableKey}']`} />
    {:else if language === Language.PHP}
        <Code withLineNumbers withCopy language="php" code={`getenv('${variableKey}')`} />
    {:else if language === Language.Python}
        <Code
            withLineNumbers
            withCopy
            language="python"
            code={`os.environ.get('${variableKey}')`} />
    {:else if language === Language.Ruby}
        <Code withLineNumbers withCopy language="ruby" code={`ENV['${variableKey}']`} />
    {:else if language === Language.Deno}
        <Code withLineNumbers withCopy language="js" code={`Deno.env.get("${variableKey}")`} />
    {:else if language === Language.Dart}
        <Code
            withLineNumbers
            withCopy
            language="dart"
            code={`Platform.environment['${variableKey}']`} />
    {:else if language === Language.Kotlin}
        <Code
            withLineNumbers
            withCopy
            language="kotlin"
            code={`System.getenv().getOrDefault("${variableKey}")`} />
    {:else if language === Language.Swift}
        <Code
            withLineNumbers
            withCopy
            language="swift"
            code={`ProcessInfo.processInfo.environment["${variableKey}"]`} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showSnippet = false)}>Close</Button>
    </svelte:fragment>
</Modal>
