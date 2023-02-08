<script lang="ts">
    import { Copy } from '../components';

    export let value: string;
</script>

<Copy {value}>
    <span data-testid="copy-content">Content</span>
</Copy>
