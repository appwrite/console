<script lang="ts">
    import { Code } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';
    import LL from '$i18n/i18n-svelte';

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
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.getSdk()}</svelte:fragment>
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
                        {$LL.console.project.forms.overview.texts.selectFile()} > {$LL.console.project.forms.overview.texts.addPackages()}
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        {$LL.console.project.forms.overview.texts.searchAppwrite()}
                        <a class="link" href="https://github.com/appwrite/sdk-for-apple">
                            https://github.com/appwrite/sdk-for-apple
                        </a>
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text"
                        >{$LL.console.project.forms.overview.texts.selectTargetProject()}</span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        {$LL.console.project.forms.overview.texts.selectAndAddPackage()}
                    </span>
                </li>
                <li class="numeric-list-item">
                    <span class="text">
                        {$LL.console.project.forms.overview.texts.productCheck()}
                    </span>
                </li>
            </ol>
        {:else if method === Method.Swift}
            <p>{$LL.console.project.forms.overview.texts.addToSwift()}</p>
            <Code withCopy withLineNumbers label="Swift" language="swift" code={example1} />
            <p class="common-section">{$LL.console.project.forms.overview.texts.addDependency()}</p>
            <Code withCopy withLineNumbers label="Swift" language="swift" code={example2} />
        {/if}
    </div>
</WizardStep>
