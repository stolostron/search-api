import { isRequired } from '../lib/utils';
import logger from '../lib/logger';


export default class OverviewModel {
  constructor({ searchConnector = isRequired('searchConnector') }) {
    this.searchConnector = searchConnector;
  }

  checkSearchServiceAvailable() {
    if (!this.searchConnector.isServiceAvailable()) {
      logger.error('Unable to resolve search request because Redis is unavailable.');
      throw Error('Search service is unavailable');
    }
  }


  async resolveClustersCount() {
    await this.checkSearchServiceAvailable();
    return this.searchConnector.runOverviewClustersQuery();
  }

  async resolvePodStates() {
    await this.checkSearchServiceAvailable();
    return this.searchConnector.runOverviewPodStates();
  }

  async resolveNonCompliantClusters() {
    await this.checkSearchServiceAvailable();
    return this.searchConnector.runOverviewNonCompliantClusters();
  }
}
