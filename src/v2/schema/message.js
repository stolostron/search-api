import { gql } from 'apollo-server-express';
export const typeDef = gql`
type Message {
  id: String
  kind: String
  description: String
}
`;
export const resolver = {
  Query: {
    messages: (parent, args, { searchModel, req }) => searchModel.resolveSearchCount({ ...args, req }),
  },
};

