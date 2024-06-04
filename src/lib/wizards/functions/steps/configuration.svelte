<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import { FormList, InputFile, InputText } from '$lib/elements/forms';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import { WizardStep } from '$lib/layout';
    import { createFunction, createFunctionDeployment } from '../store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Configuration</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set your deployment configuration and any build commands here.
    </svelte:fragment>
    <FormList>
        <InputFile
            label="Upload a zip file (tar.gz) containing your function source code"
            allowedFileExtensions={['gz']}
            bind:files={$createFunctionDeployment}
            required />

        <InputText
            label="Entrypoint"
            id="entrypoint"
            placeholder="Entrypoint"
            bind:value={$createFunction.entrypoint}
            required />
        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Build commands</svelte:fragment>
                <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                <FormList>
                    <InputTextarea
                        label="Commands"
                        placeholder="Enter a build commad (e.g. 'npm install')"
                        id="build"
                        tooltip="Enter a single command or chain multiple commands with the && operator"
                        bind:value={$createFunction.commands} />
                </FormList>
            </CollapsibleItem>
        </Collapsible>
    </FormList>
</WizardStep>
