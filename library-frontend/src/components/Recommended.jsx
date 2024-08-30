import BookFilter from "./BookFilter"


const Recommended = ({ show, favoriteGenre }) => {

    if (!show) {
        return null
    }

    return (
        <div>
            <h2>recommendations</h2>
            <div>
            books in your favorite genre: {favoriteGenre}
                <table>
                    <tbody>
                        <tr>
                            <th></th>
                            <th>author</th>
                            <th>published</th>
                        </tr>
                        <BookFilter filter={favoriteGenre}/>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Recommended