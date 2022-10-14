<script lang="ts">
	import Tweet from '$root/components/tweet.svelte';
	import Compose from '$root/components/compose.svelte';
  import type { PageData } from './$types';
  export let data: PageData;
</script>


<svelte:head>
	<title>Home</title>
</svelte:head>

<h1>Feed</h1>

{#each data.tweets as tweet (tweet.id)}
	<Tweet {tweet} />
{/each}

<Compose />

<style>
	h1 {
		position: sticky;
		top: 0;
		padding: var(--spacing-8) var(--spacing-24);
		font-size: var(--font-24);
		backdrop-filter: blur(100px);
	}
</style>
