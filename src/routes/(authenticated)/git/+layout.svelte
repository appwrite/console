<script>
    import { Container } from '$lib/layout';
    import { loading } from '$routes/store';

    loading.set(false);
</script>

<Container>
    <slot />
</Container>
