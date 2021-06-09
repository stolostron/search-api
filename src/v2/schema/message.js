import { gql } from "apollo-server-express";
import logger from "../lib/logger";
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
      const messages = [];
      const disabledClusters = await searchModel.resolveSearchCount({
        filters: [
          { property: "kind", values: ["cluster"] },
          { property: "addon", values: ["search-collector=false"] },
          { property: "name", values: ["!local-cluster"] },
        ],
      });
      if (disabledClusters > 0) {
        messages.push({
          id: "S01",
          kind: "information",
          description: "Search is disabled on some of your managed clusters.",
        });
      }
      return messages;
    },
  },
};
