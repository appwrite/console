<script lang="ts">

    export let organizationId: string| undefined;
    export let type: string = "createOrganization";
    export let billingPlan: string;
    export let collaborators: string[];
    export let couponId: string;
    export let fixedCoupon = false;

    let getEstimage = () => {
        return {}
    }

    $: estimate = getEstimage();

</script>