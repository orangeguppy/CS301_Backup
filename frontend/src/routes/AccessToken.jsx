import React from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const AccessToken = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // TODO: save the access token to local storage/cookie/memory
  useEffect(() => {
    window.location.href='http://localhost:3000/'
  }, [searchParams])
  
  return (
    <div>Tutorial: {searchParams.get('access_token')}</div>
  )
}

export default AccessToken

