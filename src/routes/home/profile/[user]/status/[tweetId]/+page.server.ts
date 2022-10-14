import prisma from '$root/lib/prisma';
import type { TweetType } from '$root/types';
import { timePosted } from '$root/utils/date';
import type { User } from '@prisma/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad<{ tweet: TweetType }> = async ({ params }) => {
	const tweet = await prisma.tweet.findFirst({
		where: { url: params.tweetId },
		include: { user: true }
	});

	if (!tweet) {
		throw error(404, 'Not found');
	}

	const liked = await prisma.liked.findMany({
		where: { userId: 1 },
		select: { tweetId: true }
	});

	const likedTweets = liked.map(({ tweetId }) => tweetId);

	const userTweet = {
		id: tweet.id,
		content: tweet.content,
		likes: tweet.likes,
		posted: timePosted(tweet.posted),
		url: tweet.url,
		avatar: tweet.user.avatar,
		handle: tweet.user.handle,
		name: tweet.user.name,
		liked: likedTweets.includes(tweet.id)
	};

	return { tweet: userTweet };
};
