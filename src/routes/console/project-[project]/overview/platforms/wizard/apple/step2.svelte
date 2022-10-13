<script lang="ts">
    import { Code } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    enum Method {
        Xcode,
        Swift
    }

    let method: Method = Method.Xcode;

    const example1 = `dependencies: [
    .package(
        name: "Appwrite",
        url: "https://github.com/appwrite/sdk-for-swift",
        .exact("${$versions['client-apple']}")
    )
]')`;
    const example2 = `targets: [
    .target(
        name: "[YOUR_TARGET]",
        dependencies: [
            "Appwrite"
        ]
    )
]`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Get the SDK</svelte:fragment>
    <div class="u-flex u-gap-16 u-margin-block-start-8">
        <Pill button on:click={() => (method = Method.Xcode)} selected={method === Method.Xcode}>
            Xcode
        </Pill>
        <Pill button on:click={() => (method = Method.Swift)} selected={method === Method.Swift}>
            Swift Packages
        </Pill>
    </div>
    <div class="common-section">
        {#if method === Method.Xcode}
            <ol class="numeric-list">
                <li class="numeric-list-item">
                    <span class="text">
                        Select File > Swift Packages > Add Package Dependency
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        Search for the Appwrite SDK with the URL
                        <a class="link" href="https://github.com/appwrite/sdk-for-apple">
                            https://github.com/appwrite/sdk-for-apple
                        </a>
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text"> Add version rules </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        Select next and wait for package resolution to complete
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        Make sure `Appwrite` is selected to add to your target and select finish
                    </span>
                </li>
            </ol>
        {:else if method === Method.Swift}
            <p class="text">Add this to your Package.swift file:</p>
            <Code showCopy showLineNumbers label="Swift" language="swift" code={example1} />
            <p class="text">Then add the dependency to your target:</p>
            <Code showCopy showLineNumbers label="Swift" language="swift" code={example2} />
        {/if}
    </div>
</WizardStep>
