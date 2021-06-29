import { createContext, ReactNode, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { auth, firebase } from "../services/firebase"

type User = {
  id: string
  name: string
  avatar: string
}

type AuthContextType = {
  user: User | undefined
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

type AuthContextProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthContextProvider(props: AuthContextProviderProps) {
  const history = useHistory()
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, photoURL, uid } = user

        if (!displayName || !photoURL) {
          throw new Error("Missing information from Google Account.")
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider()

    const result = await auth.signInWithPopup(provider)
    console.log(result)

    if (result.user) {
      const { displayName, photoURL, uid } = result.user

      if (!displayName || !photoURL) {
        throw new Error("Missing information from Google Account.")
      }

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL,
      })
    }
  }

  async function signOut() {
    const result = await auth.signOut()
    if (result === undefined) {
      setUser(undefined)
      history.push("/")
    }
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
      {props.children}
    </AuthContext.Provider>
  )
}
