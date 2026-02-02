import '../styles/globals.css'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

const authPages = ['/login', '/register', '/']

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authPages.includes(router.pathname)) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">BeBetter</h2>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const needsLayout = !authPages.includes(router.pathname) && isAuthenticated

  return needsLayout ? (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Component {...pageProps} />
  )
}
