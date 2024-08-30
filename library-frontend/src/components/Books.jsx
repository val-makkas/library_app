import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries/qeuries"
import { useState } from "react"
import BookFilter from "./BookFilter"

const Books = (props) => {

  const [filter, setFilter] = useState('all genres')

  const response = useQuery(ALL_BOOKS)

  if (response.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const books = response.data.allBooks

  const allGenres = new Set()

  books.forEach(book => {
    book.genres.forEach(genre => {
      allGenres.add(genre)
    })
  })

  console.log(filter)

  return (
    <div>
      <h2>books</h2>
      <div>
        Select a filter:
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value={'all genres'}>all genres</option>
          {Array.from(allGenres).map((genre) => 
            <option key={genre} value={genre}>{genre}</option>
          )}
        </select>
      </div>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {filter === 'all genres'
              ? books.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
                ))
              : <BookFilter filter={filter}/>
              }
            </tbody>
          </table>
    </div>
  )
}

export default Books
