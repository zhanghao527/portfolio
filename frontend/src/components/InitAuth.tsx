import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/stores'
import { getLoginUser } from '@/api/userController'
import { setLoginUser } from '@/stores/loginUser'
import { clearAccessToken, getAccessToken } from '@/libs/auth'

export default function InitAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()

  const doInit = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return
    try {
      const res = await getLoginUser()
      if (res.data) {
        dispatch(setLoginUser({ ...res.data, token }))
      }
    } catch {
      clearAccessToken()
    }
  }, [dispatch])

  useEffect(() => {
    doInit()
  }, [doInit])

  return <>{children}</>
}
