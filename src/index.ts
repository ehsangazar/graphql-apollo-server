import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const prisma = new PrismaClient();

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

const typeDefs = `#graphql
  type Post {
    id: String!
    title: String!
    content: String!
  }

  type Book {
    title: String
    author: String
  }

  type Query {
    post(id: String!): Post
    posts: [Post!]!
    books: [Book]
    searchPosts(query: String!): [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    updatePost(id: String!, title: String, content: String): Post!
    deletePost(id: String!): Post!
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    posts: () => {
      return prisma.post.findMany();
    },
    post: async (parent, args, context, info) => {
      return prisma.post.findUnique({
        where: {
          id: args.id,
        },
      });
    },
    searchPosts: async (parent, args, context, info) => {
      return prisma.post.findMany({
        where: {
          OR: [
            {
              title: {
                contains: args.query,
              },
            },
            {
              content: {
                contains: args.query,
              },
            },
          ],
        },
      });
    },
  },
  Mutation: {
    createPost: async (parent, args, context, info) => {
      const newPost = await prisma.post.create({
        data: {
          title: args.title,
          content: args.content,
        },
      });
      return newPost;
    },
    updatePost: async (parent, args, context, info) => {
      return prisma.post.update({
        where: {
          id: args.id,
        },
        data: {
          title: args.title,
          content: args.content,
        },
      });
    },
    deletePost: async (parent, args, context, info) => {
      return prisma.post.delete({
        where: {
          id: args.id,
        },
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
