import prisma from '$root/lib/prisma';
import type { TweetType } from '$root/types';
import { timePosted } from '$root/utils/date';
import type { User } from '@prisma/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad<{ profile: User; tweets: TweetType[] }> = async ({ params }) => {
	const profile = await prisma.user.findFirst({
		where: { name: params.user }
	});

	const tweets = await prisma.tweet.findMany({
		where: { user: { id: 1 } },
		include: { user: true },
		orderBy: { posted: 'desc' }
	});

	const liked = await prisma.liked.findMany({
		where: { userId: 1 },
		select: { tweetId: true }
	});

	const likedTweets = liked.map(({ tweetId }) => tweetId);

	if (!profile || !tweets || tweets.length === 0) {
		throw error(404, 'Not found');
	}

	const userTweets = tweets.map((tweet) => {
		return {
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
	});

	return { profile, tweets: userTweets };
};
