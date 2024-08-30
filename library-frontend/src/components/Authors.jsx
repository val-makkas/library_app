import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries/qeuries"
import { useEffect, useState } from "react"

const Authors = (props) => {  
  const response = useQuery(ALL_AUTHORS)

  const [selectedAuthor, setSelectedAuthor] = useState("Select an Author")
  const [born, setBorn] = useState('')
  
  const [ editAuthor , result ] = useMutation(EDIT_AUTHOR, {
      refetchQueries: [ { query: ALL_AUTHORS}]
  })

  useEffect(() => {
    if (result.data && result.data.editAuthor === null) {

    }
  }, [result.data])


  if (!props.show) {
    return null
  }

  if (response.loading) {
    return <div>loading...</div>
  }

  const authors = response.data.allAuthors

  const submit = (e) => {
      e.preventDefault()
      const bornInt = Number(born)
      editAuthor({ variables: { name: selectedAuthor, setBornTo: bornInt }})
      setSelectedAuthor("Select an Author")
      setBorn('')
  }
  

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token && (
      <div>
            <h2>Set birthyear</h2>
            <div>
                name
                <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
                    <option value={"Select an Author"}>Select an Author</option>
                    {authors.map( (author) => 
                    <option key={author.name}>{author.name}</option>
                    )}
                </select>
            </div>
            <div>
                born
                <input 
                    type="number"
                    value={born}
                    onChange={({ target }) => setBorn(target.value)}
                />
            </div>
            <button onClick={submit}>
                update author
            </button>
        </div>
      )}
    </div>
  )
}

export default Authors
