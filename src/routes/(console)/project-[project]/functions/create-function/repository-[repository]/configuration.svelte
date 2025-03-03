<script lang="ts">
    import { Roles } from '$lib/components/permissions';
    import { Link } from '$lib/elements';
    import { InputText } from '$lib/elements/forms';
    import { Accordion, Fieldset, Layout } from '@appwrite.io/pink-svelte';

    export let buildCommand = '';
    export let scopes: string[] = [];
</script>

<Fieldset legend="Configuration">
    <Layout.Stack>
        <Accordion title="Build settings" badge="Optional">
            <Layout.Stack gap="xl">
                Set up how your project is built.
                <InputText
                    id="installCommand"
                    label="Install command"
                    bind:value={buildCommand}
                    placeholder="npm install" />
            </Layout.Stack>
        </Accordion>
        <Accordion title="Execute access" badge="Optional">
            <Layout.Stack gap="xl">
                Choose who can execute this function using the client API. <Link external href="#"
                    >Learn more</Link>

                <Roles bind:roles={scopes} />
            </Layout.Stack>
        </Accordion>
    </Layout.Stack>
</Fieldset>
