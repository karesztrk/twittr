import prisma from '$root/lib/prisma';
import type { TweetType } from '$root/types';
import { timePosted } from '$root/utils/date';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad<{ tweets: TweetType[] }> = async () => {
	// get the tweets and the user data (Prisma 😍)
	const data = await prisma.tweet.findMany({
		include: { user: true },
		orderBy: { posted: 'desc' }
	});

	// get the liked tweets
	const liked = await prisma.liked.findMany({
		where: { userId: 1 },
		select: { tweetId: true }
	});

	// we just want an array of the ids
	const likedTweets = liked.map(({ tweetId }) => tweetId);

	// we can shape the data however we want
	// so our user doesn't have to pay the cost for it
	const tweets = data.map((tweet) => {
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

	if (!tweets) {
		return { tweets: [] };
	}

	return { tweets };
};

export const actions: Actions = {
	tweet: async ({ request }) => {
		const data = await request.formData();
		const tweet = String(data.get('tweet'));

		// you should probably use a validation library
		if (tweet.length > 140) {
			return {
				status: 400,
				body: 'Maximum Tweet length exceeded.',
				headers: { location: '/home' }
			};
		}

		// the user id is hardcoded but you can get it from a session
		await prisma.tweet.create({
			data: {
				posted: new Date(),
				url: Math.random().toString(16).slice(2),
				content: tweet,
				likes: 0,
				user: { connect: { id: 1 } }
			}
		});

		return {};
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const tweetId = data.get('id');
		if (!tweetId) {
			return {
				status: 400
			};
		}

		await prisma.tweet.delete({ where: { id: +tweetId } });

		return {
			status: 303,
			headers: { location: '/home' }
		};
	},
	like: async ({ request }) => {
		const data = await request.formData();
		const tweetId = data.get('id');
		if (!tweetId) {
			return {
				status: 400
			};
		}

		const id = +tweetId;
		const liked = await prisma.liked.count({
			where: { tweetId: id }
		});

		if (liked === 1) {
			await prisma.liked.delete({ where: { tweetId: id } });

			const count = await prisma.tweet.findUnique({
				where: { id },
				select: { likes: true }
			});

			if (count === null) {
				return {
					status: 500
				};
			}

			await prisma.tweet.update({
				where: { id },
				data: { likes: (count.likes -= 1) }
			});

			return {
				status: 303,
				headers: {
					location: '/home'
				}
			};
		}

		await prisma.liked.create({
			data: {
				tweetId: id,
				user: { connect: { id: 1 } }
			}
		});

		const count = await prisma.tweet.findUnique({
			where: { id },
			select: { likes: true }
		});

		if (count === null) {
			return {
				status: 500
			};
		}

		await prisma.tweet.update({
			where: { id },
			data: { likes: (count.likes += 1) }
		});

		return {
			status: 303,
			headers: { location: '/home' }
		};
	}
};
