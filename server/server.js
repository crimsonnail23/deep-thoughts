const express = require('express');
const path = require('path');
//import apolloServer
const { ApolloServer}=require('apollo-server-express');

const {authMiddleware}= require('./utils/auth');

//import typeDefs and resolvers
const { typeDefs, resolvers}=require('./schemas')
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
//create new Apollo server and pass in our schema data.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Serve up static assets
if (process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname,'../client/build')));
}

// app.get('*', (req,res)=>{
//   res.sendFile(path.join(__dirname,'../client/build/index.html'));
// })


//create a new instance of an Apollo server with the graphql schema.
const startApolloServer = async (typeDefs, resolvers)=>{
  await server.start();
  //integrate our Apollo Server with express application as middleware.
  server.applyMiddleware({ app });


  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where we can go to test our GQL API
      console.log(`use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })

};

// call the async function to start the server.
startApolloServer(typeDefs,resolvers);
