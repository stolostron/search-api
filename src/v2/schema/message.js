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
        const id = "S01";
        const kind = "information";
        const description =
          "Currently, search is disabled on some of your managed clusters. Some data might be missing from the console view. See _____ to enable search.";
        messages.push({
          id: id,
          kind: kind,
          description: description,
        });
      }
      return messages;
    },
  },
};
