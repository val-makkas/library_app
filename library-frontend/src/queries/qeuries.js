import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query allBooks {
    allBooks {
      title
      published
      author {
        name
      }
      genres
    }
  }
`
export const FILTER_BOOKS= gql`
  query filterBooks($genre: String!) {
    allBooks(genre: $genre){
      title
      published
      author {
        name
      }
      genres
    }
  }
`

export const ADD_BOOK = gql`
  mutation createBook( $title: String!, $published: String!, $author: String!, $genres: [String!]!) {
    addBook (
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
        title
        published
        author {
          name
        }
        genres
    }
  }
`
export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
        name: $name,
        setBornTo: $setBornTo
    ) {
        name
        born
        bookCount
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      token
      favoriteGenre
    }
  }
`