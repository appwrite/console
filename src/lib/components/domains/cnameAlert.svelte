<script lang="ts">
    import { Link } from '$lib/elements';
    import { Alert, InlineCode } from '@appwrite.io/pink-svelte';
</script>

<Alert.Inline>
    <p>
        If your domain uses CAA records, ensure there is an <InlineCode code="issue" /> policy for <InlineCode
            code="certainly.com" /> - otherwise, SSL setup may fail.
    </p>
    <br />
    <p>
        A list of all domain providers and their DNS setting is available <Link
            variant="muted"
            external
            href="https://appwrite.io/docs/advanced/platform/custom-domains">here</Link
        >.
    </p>
</Alert.Inline>
