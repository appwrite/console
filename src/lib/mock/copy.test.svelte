<script>
    import { Copy } from '../components';

    export let value = false;
</script>

<Copy {value}>
    <span data-testid="copy-content">Content</span>
</Copy>
