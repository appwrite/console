<script lang="ts">
	import { Card } from '$lib/components';
	import {
		Button,
		Form,
		FormItem,
		InputSwitch,
		InputRadio,
		InputTags,
		InputText
	} from '$lib/elements/forms';
	import { Container } from '$lib/layout';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { collection } from './store';

	const updateCollection = async () => {
		try {
			await sdkForProject.database.updateCollection(
				$collection.$id,
				$collection.name,
				$collection.permission,
				$collection.$read,
				$collection.$write,
				$collection.enabled
			);
			addNotification({
				message: 'Collection was updated successfully',
				type: 'success'
			});
		} catch (error) {
			addNotification({
				message: error.message,
				type: 'error'
			});
		}
	};
</script>

<Container>
	<h1>Settings</h1>
	<Form on:submit={updateCollection}>
		<Card>
			<InputText bind:value={$collection.name} label="Name" id="name" />
			<InputSwitch bind:value={$collection.enabled} label="Enabled" id="enabled" />
			<h2>Permissions</h2>
			<p>Choose the permissions model for this collection.</p>
			<InputRadio
				bind:group={$collection.permission}
				value="collection"
				id="permission-collection"
				name="permission"
				label="Collection Level"
			/>
			<p>With Collection Level permissions, you assign permissions only once in the collection.</p>
			<p>
				In this permission level, permissions assigned to collection takes the precedence and
				documents permissions are ignored.
			</p>
			{#if $collection.permission === 'collection'}
				<InputTags
					bind:tags={$collection.$read}
					label="Read Access"
					id="read"
					helper="Add 'role:all' for wildcard access"
					placeholder="User ID, Team ID or Role"
				/>
				<InputTags
					bind:tags={$collection.$write}
					label="Write Access"
					id="read"
					helper="Add 'role:all' for wildcard access"
					placeholder="User ID, Team ID or Role"
				/>
			{/if}
			<InputRadio
				bind:group={$collection.permission}
				value="document"
				id="permission-document"
				name="permission"
				label="Document Level"
			/>
			<p>
				With Document Level permissions, you have granular access control over every document. Users
				will only be able to access documents for which they have explicit permissions.
			</p>
			<p>
				In this permission level, document permissions take precedence and collection permissions
				are ignored.
			</p>
			<FormItem>
				<Button submit>Update</Button>
			</FormItem>
		</Card>
	</Form>
</Container>
