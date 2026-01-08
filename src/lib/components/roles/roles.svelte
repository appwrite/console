<script>
    import Base from './base.svelte';

    const { isProjectSpecific = false } = $props();
</script>

<Base>
    <div class="u-flex-vertical u-gap-8">
        <p class="u-bold">Roles</p>
        <p>
            {isProjectSpecific
                ? 'Owner, Developer, Editor and Analyst'
                : 'Owner, Developer, Editor, Analyst and Billing.'}
        </p>
        <p>
            <a
                class="link"
                target="_blank"
                rel="noopener noreferrer"
                href="https://appwrite.io/docs/advanced/platform/roles">Learn more</a> about roles.
        </p>
    </div>
</Base>
