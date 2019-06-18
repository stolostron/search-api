/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import GraphQLJSON from 'graphql-type-json';

export const typeDef = `
scalar JSON
`;

export const resolver = {
  JSON: GraphQLJSON,
};
