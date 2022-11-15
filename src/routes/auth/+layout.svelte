<script>
    import { Container } from '$lib/layout';
    import { loading } from '../store';

    loading.set(false);
</script>

<Container>
    <slot />
</Container>
