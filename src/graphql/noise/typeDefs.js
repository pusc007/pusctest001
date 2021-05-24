const { gql } = require("apollo-server-express");
module.exports = gql`
  scalar Date
  type User {
    id: ID!
    token: String
    casenum: String!
    licensenb: String!
    username: String!
    idcard: String!
    address: String!
    redate: Date
    exdate: Date
    city: String
    site: String
    result: Boolean
  }
  type Query {
    me: User
  }
`;
