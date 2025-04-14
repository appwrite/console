<script lang="ts">
    import { Roles } from '$lib/components/permissions';
    import { Link } from '$lib/elements';
    import { InputText } from '$lib/elements/forms';
    import { Accordion, Fieldset, Layout } from '@appwrite.io/pink-svelte';

    export let buildCommand = '';
    export let roles: string[] = [];
</script>

<Fieldset legend="Settings">
    <Layout.Stack>
        <Accordion title="Build settings" badge="Optional">
            <Layout.Stack gap="xl">
                <InputText
                    id="installCommand"
                    label="Install command"
                    bind:value={buildCommand}
                    placeholder="npm install" />
            </Layout.Stack>
        </Accordion>
        <Accordion title="Execute access" badge="Optional" hideDivider>
            <Layout.Stack gap="xl">
                <span>
                    Choose who can execute this function using the client API. <Link
                        external
                        href="https://appwrite.io/docs/advanced/platform/permissions"
                        >Learn more</Link>
                </span>

                <Roles bind:roles />
            </Layout.Stack>
        </Accordion>
    </Layout.Stack>
</Fieldset>
