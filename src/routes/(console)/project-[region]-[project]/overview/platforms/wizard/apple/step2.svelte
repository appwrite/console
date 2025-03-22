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
    <svelte:fragment slot="title">Install</svelte:fragment>
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
                        In the menu bar under Select File, select Add Packages
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
                    <span class="text"
                        >In the right panel, select your target project and add your desired version
                        rules</span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        Select Add Package and wait for package resolution to complete
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        Make sure the Appwrite package product is checked and select Add Package
                        again
                    </span>
                </li>
            </ol>
        {:else if method === Method.Swift}
            <p>Add this to your <code class="inline-code">Package.swift</code> file.</p>
            <Code withCopy withLineNumbers label="Swift" language="swift" code={example1} />
            <p class="common-section">Then add the dependency to your target.</p>
            <Code withCopy withLineNumbers label="Swift" language="swift" code={example2} />
        {/if}
    </div>
</WizardStep>
