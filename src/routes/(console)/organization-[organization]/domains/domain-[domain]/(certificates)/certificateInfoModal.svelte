<script lang="ts">
    import { Button, InputText, InputTextarea } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let selectedCertificate; //TODO: add type
</script>

<Modal title="Advanced information" bind:show>
    <Layout.Stack gap="xxl">
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">Issued to</Typography.Text>
            <Layout.Stack gap="l">
                <InputText readonly id="cn" label="Common Name (CN)" value={selectedCertificate} />
                <Layout.Stack direction="row" gap="l">
                    <InputText
                        readonly
                        id="org"
                        label="Organization (O)"
                        value={selectedCertificate} />
                    <InputText
                        readonly
                        id="cn"
                        label="Organization Unit (OU)"
                        value={selectedCertificate} />
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">Issued by</Typography.Text>
            <Layout.Stack gap="l">
                <InputText readonly id="cn" label="Common Name (CN)" value={selectedCertificate} />
                <Layout.Stack direction="row" gap="l">
                    <InputText
                        readonly
                        id="byo"
                        label="Organization (O)"
                        value={selectedCertificate} />
                    <InputText
                        readonly
                        id="byou"
                        label="Organization Unit (OU)"
                        value={selectedCertificate} />
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">Validity period</Typography.Text>
            <Layout.Stack direction="row" gap="l">
                <InputText readonly id="issued" label="Issued on" value={selectedCertificate} />
                <InputText readonly id="expires" label="Expires on" value={selectedCertificate} />
            </Layout.Stack>
        </Layout.Stack>
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">SHA-256 fingerprints</Typography.Text>
            <Layout.Stack gap="l">
                <InputTextarea
                    readonly
                    id="cetificate"
                    label="Certificate"
                    value={selectedCertificate} />
                <InputTextarea readonly id="pb" label="Public key" value={selectedCertificate} />
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit danger>Delete</Button>
    </svelte:fragment>
</Modal>
