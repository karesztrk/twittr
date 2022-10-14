<script lang="ts">
	import Tweet from '$root/components/tweet.svelte'
	import type { PageData } from './$types';

	export let data: PageData;

	export let tweet = data.tweet;
</script>

<svelte:head>
	<title>{tweet.name} on Twittr: "{tweet.content}..."</title>
</svelte:head>

<h1>Profile</h1>

<Tweet {tweet} />

