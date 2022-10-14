<script context="module" lang="ts">
  import { page } from '$app/stores';
</script>

<div class="error">
	<h1>{$page.status}: {$page?.error?.message}</h1>
</div>

<style>
	.error {
		display: grid;
		gap: var(--spacing-32);
		padding: var(--spacing-24) var(--spacing-32);
		place-items: center;
	}
</style>
