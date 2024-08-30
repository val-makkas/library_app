import { useMutation } from "@apollo/client"
import { useEffect, useState } from "react"
import { LOGIN } from "../queries/qeuries"


const LoginForm = ({ show, setFavoriteGenre, setToken, setError, setPage }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error)
        }
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.token
            setToken(token)
            localStorage.setItem("app-user-token", token)
            const favoriteGenre = result.data.login.favoriteGenre
            setFavoriteGenre(favoriteGenre)
        }
    }, [result.data])

    if (!show) {
        return null
    }

    const submit = (e) => {
      e.preventDefault()
        login({ variables: {
            username,
            password
        }})
        setPage("authors")
    }

    return (
      <form onSubmit={submit}>
        <h2>Login</h2>
        <div>
          username:
          <input 
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password:
          <input 
            type="password"
            value={[password]}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    )
}

export default LoginForm