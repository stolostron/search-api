import { gql } from 'apollo-server-express';

export const typeDef = gql`
  type Message {
    # Unique identifier for each message.
    id: String!
    # Describes the type of message. Expected values are: information, warning, error.
    kind: String
    # Message text.
    description: String
  }
`;

export const resolver = {
  Query: {
    messages: async (parent, args, { searchModel }) => {
      const messages = [];
      const disabledClusters = await searchModel.resolveSearchCount({
        filters: [
          { property: 'kind', values: ['cluster'] },
          { property: 'addon', values: ['search-collector=false'] },
          { property: 'name', values: ['!local-cluster'] },
        ],
      });
      if (disabledClusters > 0) {
        messages.push({
          id: 'S20',
          kind: 'information',
          description: 'Search is disabled on some of your managed clusters.',
        });
      }
      return messages;
    },
  },
};
