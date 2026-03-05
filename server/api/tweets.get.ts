export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const bearerToken = config.xBearerToken
  const username = config.public.xUsername

  if (!bearerToken || !username) {
    // Return fallback data when no credentials configured
    return {
      tweets: [
        {
          id: '1',
          text: 'Shipped a new feature today. Feels good.',
          created_at: '2026-03-04T14:32:00.000Z',
          url: '#',
        },
        {
          id: '2',
          text: 'The best code is the code you don\'t write.',
          created_at: '2026-03-02T09:15:00.000Z',
          url: '#',
        },
        {
          id: '3',
          text: 'Working on something new. More soon.',
          created_at: '2026-02-28T22:41:00.000Z',
          url: '#',
        },
        {
          id: '4',
          text: 'Go is underrated for web APIs.',
          created_at: '2026-02-25T11:08:00.000Z',
          url: '#',
        },
        {
          id: '5',
          text: 'Terminal > GUI. Fight me.',
          created_at: '2026-02-20T16:55:00.000Z',
          url: '#',
        },
      ],
      source: 'fallback',
    }
  }

  try {
    // Step 1: Get user ID from username
    const userRes = await $fetch<{ data: { id: string } }>(
      `https://api.x.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    )

    const userId = userRes.data.id

    // Step 2: Get recent tweets
    const tweetsRes = await $fetch<{
      data?: Array<{ id: string; text: string; created_at: string }>
    }>(
      `https://api.x.com/2/users/${userId}/tweets`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
        query: {
          max_results: 10,
          'tweet.fields': 'created_at,text',
          exclude: 'retweets,replies',
        },
      }
    )

    const tweets = (tweetsRes.data || []).map((t) => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      url: `https://x.com/${username}/status/${t.id}`,
    }))

    return { tweets, source: 'api' }
  } catch (error: any) {
    console.error('Twitter API error:', error?.data || error?.message || error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch tweets',
    })
  }
})
