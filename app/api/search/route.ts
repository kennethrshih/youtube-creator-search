import { NextRequest, NextResponse } from 'next/server'

interface Creator {
  handle: string
  link: string
  keyword: string
  followers: number
  email: string
  lastVideo: string
  lastVideoDate: string
  instagram: string
  tiktok: string
  linkedin: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const apiKey = process.env.YOUTUBE_API_KEY
  const minFollowers = parseInt(searchParams.get('minFollowers') || '0')
  const maxFollowers = parseInt(searchParams.get('maxFollowers') || '999999999')

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }


  try {
    // Step 1: Search for channels by keyword
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(keyword)}&maxResults=50&key=${apiKey}`
    
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    if (searchData.error) {
      return NextResponse.json(
        { error: searchData.error.message || 'YouTube API error' },
        { status: 400 }
      )
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ creators: [] })
    }

    // Step 2: Get channel statistics and snippet (includes description with potential email)
    const channelIds = searchData.items.map((item: any) => item.snippet.channelId).join(',')
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails,brandingSettings&id=${channelIds}&key=${apiKey}`
    
    const statsRes = await fetch(statsUrl)
    const statsData = await statsRes.json()

    if (statsData.error) {
      return NextResponse.json(
        { error: statsData.error.message || 'Failed to get channel stats' },
        { status: 400 }
      )
    }

    // Step 3: Get latest video for each channel
    const creators: Creator[] = []
    
    for (const channel of statsData.items || []) {
      const subscriberCount = parseInt(channel.statistics.subscriberCount || '0')
      
      if (subscriberCount < minFollowers || subscriberCount > maxFollowers) {
        continue
      }

      // Extract email and social links from channel description
      const description = channel.snippet.description || ''
      
      const emailMatch = description.match(/[\w.-]+@[\w.-]+\.\w+/)
      const email = emailMatch ? emailMatch[0] : ''
      
      const instagramMatch = description.match(/(?:instagram\.com\/|@)([a-zA-Z0-9_.]+)/i)
      const instagram = instagramMatch ? `https://instagram.com/${instagramMatch[1]}` : ''
      
      const tiktokMatch = description.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/i)
      const tiktok = tiktokMatch ? `https://tiktok.com/@${tiktokMatch[1]}` : ''
      
      const linkedinMatch = description.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i)
      const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : ''

      // Get latest video from uploads playlist
      let lastVideo = ''
      let lastVideoDate = ''
      
      const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads
      if (uploadsPlaylistId) {
        try {
          const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`
          const videosRes = await fetch(videosUrl)
          const videosData = await videosRes.json()
          
          if (videosData.items && videosData.items.length > 0) {
            const video = videosData.items[0].snippet
            lastVideo = `https://www.youtube.com/watch?v=${video.resourceId.videoId}`
            lastVideoDate = video.publishedAt.split('T')[0]
          }
        } catch (e) {
          // Skip if we can't get videos
        }
      }

      creators.push({
        handle: channel.snippet.title,
        link: `https://www.youtube.com/channel/${channel.id}`,
        keyword,
        followers: subscriberCount,
        email,
        lastVideo,
        lastVideoDate,
        instagram,
        tiktok,
        linkedin,
      })
    }

    return NextResponse.json({ creators })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search YouTube. Check your API key.' },
      { status: 500 }
    )
  }
}
