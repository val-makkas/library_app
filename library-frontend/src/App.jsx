import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Notification from "./components/Notification"
import { useApolloClient } from "@apollo/client";
import Recommended from "./components/Recommended";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)
  const [favoriteGenre, setFavoriteGenre] = useState('')
  const client = useApolloClient()

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 5000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <Notification errorMessage={error}/>
      <div>
        {token ? (
          <div>
            <button onClick={() => setPage("authors")}>authors</button>
            <button onClick={() => setPage("books")}>books</button>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={logout}>logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => setPage("authors")}>authors</button>
            <button onClick={() => setPage("books")}>books</button>
            <button onClick={() => setPage("login")}>login</button>
          </div>
        )}
      </div>

      <LoginForm show={page === "login"} setFavoriteGenre={setFavoriteGenre} setToken={setToken} setError={notify} setPage={setPage}/>

      <Authors show={page === "authors"} token={token}/>

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommended show= {page === "recommend"} favoriteGenre={favoriteGenre}/>
    </div>
  );
};

export default App;
