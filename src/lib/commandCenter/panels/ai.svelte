<script lang="ts">
    import Template from './template.svelte';

    let question = '';

    let answer =
        'To create a database in Appwrite, you can add it to your Appwrite project\'s dashboard or create it using the Appwrite CLI or the Appwrite Server SDKs. To create a database from the dashboard, access the Databases Service settings from your project\'s left-hand navigation panel, click the Create Database button, name your new database, and optionally provide a custom database ID. You can also create collections as containers of documents in your database by adding them to your database using the Appwrite API. The Appwrite API provides SDKs for different languages such as Python, JavaScript, Flutter, and Android. For example, to create a document using Kotlin for Android:\n\n```\nimport io.appwrite.Client\nimport io.appwrite.services.Databases\n\nsuspend fun main() {\n    val client = Client(applicationContext)\n        .setEndpoint("https://cloud.appwrite.io/v1")\n        .setProject("[PROJECT_ID]")\n\n    val databases = Databases(client)\n\n    try {\n        val document = databases.createDocument(\n            databaseId = "[DATABASE_ID]",\n            collectionId = "[COLLECTION_ID]",\n            documentId = ID.unique(),\n            data = mapOf("a" to "b"),\n        )\n    } catch (e: Exception) {\n        Log.e("Appwrite", "Error: " + e.message)\n    }\n}\n```\nSOURCES: \n- https://appwrite.io/docs/databases';

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    let loading = false;
    let showAnswer = false;

    async function handleSubmit() {
        loading = true;
        await sleep(1000);
        loading = false;
        showAnswer = true;
        // const res = await fetch('http://64.227.148.116:8080/', {
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     method: 'POST',
        //     body: JSON.stringify({
        //         question
        //     })
        // });

        // const data = await res.json();
        // console.log(data);
    }
</script>

<Template>
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
            bind:value={question} />
        <div class="options-list">
            <button class="options-list-button" aria-label="ask AI" type="submit">
                <span class="icon-arrow-sm-right" aria-hidden="true" />
            </button>
        </div>
    </form>
    {#if loading}
        <div class="loader" />
    {:else if showAnswer}
        <p>
            {answer}
        </p>
    {/if}
</Template>

<style>
    input {
        border: none;
        background: transparent;
    }

    .options-list-button span {
        position: relative;
        top: -1px;
    }
</style>
