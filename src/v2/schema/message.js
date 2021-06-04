import { gql } from 'apollo-server-express';
import logger from '../lib/logger';
export const typeDef = gql`
type Message {
  id: String
  kind: String
  description: String
}
`;
export const resolver = {
  Query: {
    messages: async (parent, args, { searchModel, req }) => {
        const messages = []
        const disabledClusters = await searchModel.resolveSearchCount({filters:[{ kind: 'cluster'},{ addon: 'search-collector=false'}, {name: '!local-cluster'}]})
        if (disabledClusters > 0 ){
            logger.warn('Currently, search is disabled on some of your managed clusters. Some data might be missing from the console view. See _____ to enable search.');
        }
        return messages;
      }
    }
 
};