import { Client } from "@elastic/elasticsearch";
import config from "./config";

const esClient = new Client({
  node: config.elasticSearch.url,
});

export default esClient;
