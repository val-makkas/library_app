const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')

const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Book = require('./models/bookSchema')
const Author = require('./models/authorSchema')
const User = require('./models/userSchema')

require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI

console.log(`connecting to ${MONGODB_URI}`)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connect to MongoDB')
  })
  .catch((error) => {
    console.log(`error connecting to mongodb ${error.message}`)
  })

const typeDefs = `
  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type UserInfo {
    token: String!
    favoriteGenre: String!
  }

  type Book {
    title: String!
    published: String!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook (
      title: String!
      published: String!
      author: String!
      genres: [String!]!
    ): Book
    
    addAuthor (
      name: String!
      born: Int
    ): Author

    editAuthor (
      name: String!
      setBornTo: Int!
    ): Author

    createUser (
      username: String!
      favoriteGenre: String!
    ): User

    login (
      username: String!
      password: String!
    ): UserInfo
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments,
    authorCount: async () => Author.collection.countDocuments,
    allBooks: async (root, args) => {
      let books
        if (!args.author && !args.genre)
          return await Book.find({}).populate('author')
        else if (args.author && !args.genre) {
          const author = await Author.findOne({ name: args.author})
          return await Book.find({ author: author }).populate('author')  /* (book => book.author === args.author) */ 
        }
        else if (!args.author && args.genre) 
          return await Book.find({ genres: { $in: [args.genre] }}).populate('author') /* (book => book.genres.includes(args.genre)) */
        else {
          const author = await Author.findOne({ name: args.author})
          return await Book.find({ 
              $and: [
                { author: author._id },
                { genres: { $in: [args.genre] }}
              ]
            }).populate('author')}  /* (book => (book.author === args.author && book.genres.includes(args.genre))) */
    },
    allAuthors: async () => {
        /* const authorBookCounts = books.reduce((acc, book) => {
            acc[book.author] = (acc[book.author] || 0) + 1
            return acc
        }, {})

        authors = authors.map(author => (
            {
                ...author,
                bookCount: authorBookCounts[author.name] || 0
            }
        ))

        return authors */

        return await Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
        if(!currentUser) {
          throw new GraphQLError('Wrong credentials', { extensions: { code: 'BAD_USER_INPUT' } })
        }

        const titleExists = await Book.findOne({ title: args.title})
        if (titleExists !== null) {
          throw new GraphQLError('This title already exists, please try again', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title
            }
          })
        }

        if (args.title.length < 5) {
          throw new GraphQLError('Title too small', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title
            }
          })
        }

        if (args.author.length < 4) {
          throw new GraphQLError('Authors name too small', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author
            }
          })
        }

        let author = await Author.findOne({ name: args.author })  /* (author => author.name === args.author) */

        try {
          if (!author) {
            author = new Author({ name: args.author })
            await author.save()
          }

          author.bookCount = (author.bookCount || 0) + 1

          const book = new Book({...args, author: author._id.toString()})
          await book.save()

          await author.save()

          return await book.populate('author')

        } catch (error) {
          throw new GraphQLError("Error adding book", {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: error
            }
          })
        }
    },
    addAuthor: async (root, args) => {
      if (args.name.length < 4) {
        throw new GraphQLError('Authors name too small', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name
          }
        })
      }

      const author = new Author({...args})
      await author.save()
      return author
    },
    editAuthor: async (root, args, { currentUser }) => {
        if(!currentUser) {
          throw new GraphQLError('Wrong credentials', { extensions: { code: 'BAD_USER_INPUT' } })
        }
        const author = await Author.findOne({ name: args.name })  /* (author => author.name === args.name) */

        if (!author) {
          return null
        }
        try {
        author.born = args.setBornTo
        await author.save()
        } catch (error) {
          throw new GraphQLError('Error editing author', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: error
            }
          })
        }
        return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre})

      return user.save()
        .catch(error => {
          throw new GraphQLError('Failed to create user', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'bullet') {
        throw new GraphQLError('invalid credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return {token: jwt.sign(userForToken, process.env.JWT_SECRET), favoriteGenre: user.favoriteGenre}
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({req, res}) => {
    const auth = req ? req.headers.authorization : null
    if ( auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})