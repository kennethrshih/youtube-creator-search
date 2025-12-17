'use client'

import { useState } from 'react'

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

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [minFollowers, setMinFollowers] = useState('')
  const [maxFollowers, setMaxFollowers] = useState('')
  const [uploadedAfter, setUploadedAfter] = useState('')
  const [results, setResults] = useState<Creator[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) {
      setError('Please enter a keyword or niche')
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const params = new URLSearchParams({
        keyword: keyword.trim(),
        ...(minFollowers && { minFollowers }),
        ...(maxFollowers && { maxFollowers }),
        ...(uploadedAfter && { uploadedAfter }),
      })

      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.creators || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (results.length === 0) return

    const headers = ['Channel Name', 'YouTube Link', 'Search Keyword', 'Subscriber Count', 'Email', 'Last Video', 'Last Video Date', 'Instagram', 'TikTok', 'LinkedIn']
    const rows = results.map(c => [c.handle, c.link, c.keyword, c.followers.toString(), c.email, c.lastVideo, c.lastVideoDate, c.instagram, c.tiktok, c.linkedin])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtube-creators-${keyword}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <div className="container">
      <h1>📺 YouTube Creator Search</h1>

      <div className="search-box">
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Keyword / Niche</label>
            <input
              type="text"
              placeholder="e.g. fitness, cooking, tech review"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Subscriber Range (optional)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min subscribers"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max subscribers"
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Video Upload Date (optional)</label>
            <input
              type="date"
              value={uploadedAfter}
              onChange={(e) => setUploadedAfter(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : '🔍 Search Creators'}
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      {searched && !loading && (
        <div className="results-box">
          <div className="results-header">
            <h2>Results ({results.length} creators)</h2>
            {results.length > 0 && (
              <button className="btn-secondary" onClick={downloadCSV}>
                📥 Download CSV
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Link</th>
                  <th>Subs</th>
                  <th>Last Video</th>
                  <th>IG</th>
                  <th>TikTok</th>
                  <th>LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {results.map((creator, i) => (
                  <tr key={i}>
                    <td>{creator.handle}</td>
                    <td>
                      <a href={creator.link} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </td>
                    <td>{formatFollowers(creator.followers)}</td>
                    <td>
                      {creator.lastVideo ? (
                        <a href={creator.lastVideo} target="_blank" rel="noopener noreferrer">
                          {creator.lastVideoDate}
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      {creator.instagram ? (
                        <a href={creator.instagram} target="_blank" rel="noopener noreferrer">✓</a>
                      ) : '-'}
                    </td>
                    <td>
                      {creator.tiktok ? (
                        <a href={creator.tiktok} target="_blank" rel="noopener noreferrer">✓</a>
                      ) : '-'}
                    </td>
                    <td>
                      {creator.linkedin ? (
                        <a href={creator.linkedin} target="_blank" rel="noopener noreferrer">✓</a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              No creators found. Try a different keyword or adjust subscriber range.
            </div>
          )}
        </div>
      )}

      <div className="disclaimer">
        <strong>Note:</strong> Social links and emails are extracted from channel descriptions when available.
      </div>
    </div>
  )
}

