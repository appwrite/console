<script lang="ts">
    import Code from '$lib/components/code.svelte';
    import { slide } from 'svelte/transition';
    import Template from './template.svelte';

    const MOCK = false;
    const mockAnswer =
        'To create a database with Web SDK in Appwrite, you can add it to your Appwrite project\'s dashboard by accessing the Databases Service settings from your project\'s left-hand navigation panel. Then, click the Create Database button, name your new database, and optionally provide a custom database ID. You can also create databases with the Appwrite CLI or the Appwrite Server SDKs. Once you have created your database, you can add collections to your database by navigating to it and then clicking on the Create Collection button. You can use Appwrite Realtime API to subscribe to live changes in your database. To create a document in the database, you can use the createDocument() method provided by the Web SDK. Here is an example code snippet in Kotlin for creating a document:\n\n```\nimport io.appwrite.Client\nimport io.appwrite.services.Databases\n\nsuspend fun main() {\n    val client = Client(applicationContext)\n        .setEndpoint("https://cloud.appwrite.io/v1")\n        .setProject("[PROJECT_ID]")\n\n    val databases = Databases(client)\n\n    try {\n        val document = databases.createDocument(\n            databaseId = "[DATABASE_ID]",\n            collectionId = "[COLLECTION_ID]",\n            documentId = ID.unique(),\n            data = mapOf("a" to "b"),\n        )\n    } catch (e: Exception) {\n        Log.e("Appwrite", "Error: " + e.message)\n    }\n}\n```\nSOURCES: https://appwrite.io/docs/databases';
    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    let question = '';
    let answer: string | null = null;
    let loading = false;

    async function handleSubmit() {
        loading = true;
        answer = null;
        try {
            if (MOCK) {
                await sleep(1000);
                answer = mockAnswer;
            } else {
                const res = await fetch(
                    'http://64.227.148.116:8080/?question=' + encodeURI(question),
                    {
                        headers: {
                            accept: 'application/json'
                        }
                    }
                );

                const data = await res.json();
                answer = data.answer;
            }
        } finally {
            loading = false;
        }
    }

    type AnswerSources = {
        type: 'sources';
        content: string[];
    };
    type AnswerText = {
        type: 'text';
        content: string;
    };
    type AnswerCode = {
        type: 'code';
        content: string;
    };

    type ParsedAnwer = Array<AnswerSources | AnswerText | AnswerCode>;

    function parseAnswer(answer: string) {
        if (!answer) return null;

        // Separate into text and code blocks
        const textAndCodeBlocks: Array<AnswerText | AnswerCode> = [];
        const blocks = answer.matchAll(/```(?<code>.*?)```/gs);
        let lastIndex = 0;
        for (const block of blocks) {
            const [full, code] = block;
            const index = answer.indexOf(full);
            if (index > lastIndex) {
                textAndCodeBlocks.push({
                    content: answer.slice(lastIndex, index),
                    type: 'text'
                });
            }
            textAndCodeBlocks.push({
                content: code,
                type: 'code'
            });
            lastIndex = index + full.length;
        }
        if (lastIndex < answer.length) {
            textAndCodeBlocks.push({
                content: answer.slice(lastIndex),
                type: 'text'
            });
        }

        // Split text blocks into source and text blocks
        const parsedAnswer: ParsedAnwer = [];
        for (let i = 0; i < textAndCodeBlocks.length; i++) {
            const block = textAndCodeBlocks[i];
            // Can match Sources: or Source:
            // Ignore case
            const sourcesMatch = block.content.match(/SOURCES?:\s*(?<sources>.*?)(\n|$)/i);

            if (block.type === 'code' || !sourcesMatch) {
                parsedAnswer.push(block);
                continue;
            }

            parsedAnswer.push({
                type: 'text',
                content: block.content.slice(0, sourcesMatch.index)
            });

            const sources = sourcesMatch.groups?.sources;
            parsedAnswer.push({
                type: 'sources',
                content: sources.split(',').map((s) => {
                    const match = s.match(/https?:\/\/(?<url>.*)/);
                    return match?.groups?.url || s;
                })
            });
        }

        return parsedAnswer;
    }

    $: parsedAnswer = parseAnswer(answer);
</script>

<Template --command-panel-width="600px">
    <form
        class="input-text-wrapper u-width-full-line"
        style="--amount-of-buttons: 1;"
        slot="search"
        on:submit|preventDefault={handleSubmit}>
        <input
            type="text"
            class="input-text"
            autofocus
            placeholder="Ask AI..."
            bind:value={question}
            disabled={loading} />
        <div class="options-list">
            {#if loading}
                <div class="loader" />
            {:else}
                <button
                    class="options-list-button"
                    aria-label="ask AI"
                    type="submit"
                    disabled={!question.trim() || loading}>
                    <span class="icon-arrow-sm-right" aria-hidden="true" />
                </button>
            {/if}
        </div>
    </form>
    {#if parsedAnswer}
        <div class="answer" transition:slide|local={{ duration: 250 }}>
            {#each parsedAnswer as block}
                {#if block.type === 'text'}
                    <p>{block.content}</p>
                {:else if block.type === 'code'}
                    <!-- TODO: Get language automatically -->
                    <div class="code">
                        <Code code={block.content} language="js" noMargin />
                    </div>
                {:else if block.type === 'sources'}
                    <div class="u-margin-block-start-8">
                        <p>Sources:</p>
                        <ul>
                            {#each block.content as source}
                                <li>
                                    <a class="link" href={source} target="_blank">{source}</a>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</Template>

<style lang="scss">
    input {
        border: none;
        background: transparent;
    }

    .options-list {
        align-items: center;
    }

    .options-list-button span {
        position: relative;
        top: -1px;
    }

    .loader {
        width: 1rem;
        height: 1rem;
    }

    .answer {
        margin-block-start: 1rem;
        padding-inline: 0.5rem;
        padding-block-end: 1rem;

        max-height: 55rem;
        overflow-y: auto;

        p {
            white-space: pre-wrap;
        }

        .code :global(pre) {
            translate: 0 -1rem;
        }
    }
</style>
