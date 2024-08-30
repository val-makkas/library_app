import { useQuery } from "@apollo/client"
import { FILTER_BOOKS } from "../queries/qeuries"

const BookFilter = ({ filter }) => {    
    const response = useQuery(FILTER_BOOKS, {
        variables: {
            genre: filter
        },
        fetchPolicy: 'no-cache'
    })

    if (response.loading) {
        return null
    }

    const books = response.data.allBooks

    return (
      <>
        {books.map((book) => (
            <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
            </tr>
        ))}
      </>
    )
}

export default BookFilter