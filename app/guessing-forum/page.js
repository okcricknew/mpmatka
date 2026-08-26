'use client'

import React, { useState, useEffect, useRef } from 'react'
import { db, auth } from '../../lib/firebase'
import { collection, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default function GuessingForum() {
  const [posts, setPosts] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const cachedPosts = localStorage.getItem('guessing_posts_cache')
      return cachedPosts ? JSON.parse(cachedPosts) : []
    } catch (e) {
      return []
    }
  })

  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState(null)
  
  const [profileUsername, setProfileUsername] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      return localStorage.getItem('guessing_profile_username') || ''
    } catch (e) {
      return ''
    }
  })

  const [canPost, setCanPost] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem('guessing_can_post') === 'true'
    } catch (e) {
      return false
    }
  })

  const [guessText, setGuessText] = useState('')
  const [quotingPost, setQuotingPost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showOriginalPosts, setShowOriginalPosts] = useState(true)
  const postFormRef = useRef(null)

  useEffect(() => {
    let unsubscribePosts = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'profiles', currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            const username = data.username || ''
            const isActive = data.is_approved === true
            const hasPermission =
              data.permissions?.market_update === true ||
              data.permissions?.add_results === true

            const postingAllowed = isActive && hasPermission

            setProfileUsername(username)
            setCanPost(postingAllowed)

            localStorage.setItem('guessing_profile_username', username)
            localStorage.setItem('guessing_can_post', postingAllowed ? 'true' : 'false')
          } else {
            setCanPost(false)
            localStorage.setItem('guessing_can_post', 'false')
          }
        } catch (err) {
          console.error("Error fetching user profile:", err)
        }
      } else {
        setCanPost(false)
        setProfileUsername('')
        localStorage.removeItem('guessing_profile_username')
        localStorage.setItem('guessing_can_post', 'false')
      }
    })

    const unsubscribeAdmin = subscribeAdminStatus(setIsAdmin)

    unsubscribePosts = onSnapshot(collection(db, 'guessing_posts'), (snapshot) => {
      const list = []
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.cachedTime || Date.now())
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.cachedTime || Date.now())
        return timeB - timeA
      })

      setPosts(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(list)) {
          const cacheableList = list.map(item => ({
            ...item,
            cachedTime: item.createdAt?.toMillis
              ? item.createdAt.toMillis()
              : (item.cachedTime || Date.now())
          }))
          try {
            localStorage.setItem('guessing_posts_cache', JSON.stringify(cacheableList))
          } catch (e) {}
          return list
        }
        return prev
      })
    }, (error) => {
      console.error("Posts snapshot error:", error)
    })

    return () => {
      unsubscribeAuth()
      unsubscribeAdmin()
      if (unsubscribePosts) unsubscribePosts()
    }
  }, [])

  const parseGuessText = (text) => {
    const normalizedText = text.replace(/__+/g, ' ')
    const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean)
    
    let market = 'GENERAL'
    let currentSession = 'OPEN'
    let pannas = []
    let jodi = []
    let openAnks = []
    let closeAnks = []

    lines.forEach((line, index) => {
      const upperLine = line.toUpperCase()

      if (upperLine.includes('CLOSE') || upperLine.includes('CLO') || upperLine.includes(' C ')) {
        currentSession = 'CLOSE'
      } else if (upperLine.includes('OPEN') || upperLine.includes('OPN') || upperLine.includes(' O ')) {
        currentSession = 'OPEN'
      }

      if (index === 0 && !/^\d+$/.test(line)) {
        const cleanedMarket = upperLine.replace(/OPEN|CLOSE/gi, '').trim()
        if (cleanedMarket) {
          market = cleanedMarket
        }
      }

      const hyphenMatches = line.match(/(\d{3})\s*-\s*(\d{1})/g)
      if (hyphenMatches) {
        hyphenMatches.forEach(hm => {
          const parts = hm.split('-').map(p => p.trim())
          if (parts.length === 2) {
            const pannaVal = parts[0]
            const singleVal = parts[1]

            if (!/^(\d)\1{2}$/.test(pannaVal)) {
              pannas.push(pannaVal)
            }

            if (currentSession === 'OPEN') {
              openAnks.push(singleVal)
            } else {
              closeAnks.push(singleVal)
            }
          }
        })
      }

      const foundPannas = line.match(/\b\d{3}\b/g)
      if (foundPannas) {
        foundPannas.forEach(p => {
          const isAllSame = /^(\d)\1{2}$/.test(p)
          if (!isAllSame) {
            pannas.push(p)
          } else {
            if (currentSession === 'OPEN') openAnks.push(p[0])
            else closeAnks.push(p[0])
          }
        })
      }

      const foundJodis = line.match(/\b\d{2}\b/g)
      if (foundJodis) {
        foundJodis.forEach(j => {
          jodi.push(j)
          const firstDigit = j[0]
          if (currentSession === 'OPEN') {
            openAnks.push(firstDigit)
          } else {
            closeAnks.push(firstDigit)
          }
        })
      }

      const cleanNums = line.replace(/[^0-9\s]/g, '').trim()
      if (cleanNums && !line.includes('-') && line !== market && !upperLine.includes('OPEN') && !upperLine.includes('CLOSE')) {
        const parts = cleanNums.split(/\s+/)
        parts.forEach(part => {
          if (part.length === 1 || (part.length >= 3 && /^(\d)\1+$/.test(part))) {
            const singleVal = part[0]
            if (currentSession === 'OPEN') openAnks.push(singleVal)
            else closeAnks.push(singleVal)
          }
        })
      }
    })

    return {
      market,
      session: currentSession,
      pannas: [...new Set(pannas)],
      openAnks: [...new Set(openAnks)],
      closeAnks: [...new Set(closeAnks)],
      jodi: [...new Set(jodi)]
    }
  }

  const handlePostGuess = async (e) => {
    e.preventDefault()
    if (!guessText.trim() || !user) return

    setLoading(true)
    try {
      let updatedQuotes = []
      if (quotingPost) {
        const previousQuotes = quotingPost.quotes || []
        updatedQuotes = [
          {
            username: quotingPost.username,
            text: quotingPost.guess
          },
          ...previousQuotes
        ]
      }

      const structuredData = parseGuessText(guessText)

      const newPostPayload = {
        userId: user.uid,
        username: profileUsername || 'USER',
        guess: guessText,
        parsedData: structuredData,
        quotes: updatedQuotes,
        cachedTime: Date.now()
      }

      setPosts(prev => {
        const tempPost = { id: 'temp_' + Date.now(), ...newPostPayload }
        const updatedList = [tempPost, ...prev]
        try {
          localStorage.setItem('guessing_posts_cache', JSON.stringify(updatedList))
        } catch (err) {}
        return updatedList
      })

      setGuessText('')
      setQuotingPost(null)

      await addDoc(collection(db, 'guessing_posts'), {
        ...newPostPayload,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!isAdmin || !postId) return

    const confirmed = window.confirm('Kya aap is post ko permanently delete karna chahte hain?')
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, 'guessing_posts', postId))

      setPosts(prev => {
        const updated = prev.filter(post => post.id !== postId)
        try {
          localStorage.setItem('guessing_posts_cache', JSON.stringify(updated))
        } catch (e) {}
        return updated
      })
    } catch (error) {
      console.error('Delete post error:', error)
      alert('Post delete nahi hua: ' + error.message)
    }
  }

  const formatTimestamp = (post) => {
    let date = null
    if (post.createdAt?.toDate) {
      date = post.createdAt.toDate()
    } else if (post.cachedTime) {
      date = new Date(post.cachedTime)
    }

    if (!date || isNaN(date.getTime())) {
      return 'Just now'
    }

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12
    hours = hours || 12

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  return (
    <div className="w-full mt-2 bg-white font-sans text-sm">
      <div className="bg-yellow-400 text-black text-center py-2 font-black text-sm border-b border-orange-400 uppercase tracking-wider">
        * GUESSING FORUM *
      </div>

      {canPost ? (
        <form
          ref={postFormRef}
          onSubmit={handlePostGuess}
          className="p-2 bg-gray-100 border-b border-orange-400"
        >
          {quotingPost && (
            <div className="mb-2 p-2 bg-[#00ffff] border border-orange-400 text-xs font-semibold text-black text-center max-h-48 overflow-y-auto">
              {quotingPost.quotes && [...quotingPost.quotes].reverse().map((q, idx) => (
                <div key={idx} className="text-red-600 font-bold italic text-xs mb-1">
                  Originally Posted By: <span className="uppercase">{q.username}</span>
                  <div>{q.text}</div>
                </div>
              ))}
              <div className="text-red-600 font-bold italic text-xs mt-2">
                Originally Posted By: <span className="uppercase">{quotingPost.username}</span>
                <div>{quotingPost.guess}</div>
              </div>
              <button 
                type="button" 
                onClick={() => setQuotingPost(null)}
                className="text-red-700 font-bold text-[10px] mt-2 underline block mx-auto"
              >
                Cancel Quote
              </button>
            </div>
          )}

          <textarea
            rows="10"
            placeholder={quotingPost ? "Write your reply/quote..." : "Enter your guessing numbers & text here..."}
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            className="w-full min-h-[130px] md:min-h-[160px] border p-2 text-xs font-bold rounded outline-none text-black bg-white"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-bold text-green-700">
              Guesser Name: <span className="text-blue-900 uppercase">{profileUsername || 'USER'}</span>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-1 rounded border border-black shadow"
            >
              {loading ? 'Posting...' : quotingPost ? 'Post Quote' : 'Post Guess'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-yellow-50 text-center border-b border-orange-400 text-xs text-yellow-900 font-bold">
          {user ? "🔒 Account deactivated or missing posting permissions." : "⚠️ Please login to post or quote in the forum."}
        </div>
      )}

      <div className="bg-white py-2 px-4 pt-4 mt-2 flex justify-between items-center text-xs font-bold text-black border-b-2 border-t-2 border-l-2 border-r-2 border-red-400 [border-style:groove]">
        <span>Show Original Posts</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={showOriginalPosts} 
            onChange={(e) => setShowOriginalPosts(e.target.checked)} 
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>

      <div className="p-0 pt-6 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-600 font-semibold bg-white border border-orange-400">
            No posts available in the forum.
          </div>
        ) : (
          posts
            .filter((post) => showOriginalPosts || !post.quotes?.length)
            .map((post) => {
              const hasQuotes = post.quotes && post.quotes.length > 0;
              return (
                <div key={post.id} className="w-full bg-white border-[3px] border-orange-400 shadow-sm [border-style:groove]">
                  
                  <div className="grid grid-cols-2 border-b-2 border-orange-400 text-xs font-bold [border-style:groove]">
                    <div className="bg-[#00b000] text-[#ffff00] py-1.5 px-2 flex items-center justify-start text-sm border-r-2 border-orange-400 [border-style:groove]">
                      {formatTimestamp(post)}
                    </div>
                    <div className="bg-white text-[#cc0000] py-1.5 px-2 flex items-center justify-center text-sm font-extrabold underline uppercase">
                      {post.username || 'USER'}
                    </div>
                  </div>

                  <div className="bg-white px-1 pt-8 pb-3 text-center">
                    {showOriginalPosts && hasQuotes && (
                      <div className="bg-[#00ffff] w-full p-4 mb-3 text-center">
                        {post.quotes.map((q, idx) => (
                          <div
                            key={`user-${idx}`}
                            className="text-[#ff0000] italic text-sm my-1"
                            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                          >
                            Originally Posted By:{' '}
                            <span className="uppercase">{q.username}</span>
                          </div>
                        ))}
                        <div className="mt-4">
                          {[...post.quotes].reverse().map((q, idx) => (
                            <div
                              key={`text-${idx}`}
                              className="text-[#ff0000] text-sm italic whitespace-pre-wrap leading-relaxed"
                              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                            >
                              {q.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="w-full py-2 px-1 flex justify-center items-center">
                      <div
                        className="text-black text-sm whitespace-pre-wrap leading-relaxed text-center inline-block"
                        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                      >
                        {post.guess}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-xs font-bold border-t border-b border-orange-400 [border-style:groove]">
                    <div className="bg-[#000080] text-yellow-300 py-1.5 px-2 text-sm flex items-center justify-start border-r border-orange-400 [border-style:groove]">
                      Google Chrome
                    </div>
                    <div className="bg-[#00b000] text-white py-1.5 px-2 text-sm flex items-center justify-between">
                      <a
                        href="/"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = "/"
                        }}
                        className="hover:underline"
                      >
                        [ HOME ]
                      </a>

                      {canPost && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuotingPost(post)
                            setTimeout(() => {
                              postFormRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                              })
                            }, 100)
                          }}
                          className="text-white text-sm font-bold hover:underline"
                        >
                          [ QUOTE ]
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 text-xs font-bold">
                    <div className="col-span-6 bg-[#00b000] text-white py-1.5 px-2 text-sm flex items-center justify-between border-r border-orange-400 cursor-pointer hover:underline [border-style:groove]">
                      <span onClick={() => {}}>My Profile</span>

                      {isAdmin && (
                        <div
                          onClick={() => handleDeletePost(post.id)}
                          className="text-white text-sm font-bold hover:underline"
                        >
                          [ DELETE ]
                        </div>
                      )}
                    </div>
            
                    <div 
                      onClick={scrollToTop} 
                      className="col-span-3 bg-[#000080] text-yellow-300 py-1.5 px-2 text-sm flex items-center justify-center border-r border-orange-400 cursor-pointer hover:underline"
                    >
                      GoTop
                    </div>
                    <div 
                      onClick={scrollToBottom} 
                      className="col-span-3 bg-[#000080] text-yellow-300 py-1.5 px-2 text-sm flex items-center justify-end pr-3 cursor-pointer hover:underline"
                    >
                      Bottom
                    </div>
                  </div>

                </div>
              )
            })
        )}
      </div>
    </div>
  )
            }
          
