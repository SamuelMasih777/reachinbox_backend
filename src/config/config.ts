class Config {
  public elasticSearch: { url: string | undefined };
  public httpStatus: {
    success: number;
    unauthorized: number;
    forbidden: number;
    serverError: number;
    notFound: number;
    badRequest: number;
  };

  constructor() {
    this.elasticSearch = {
      url: process.env.ELASTICSEARCH_URL,
    };
    this.httpStatus = {
      success: 200,
      unauthorized: 401,
      forbidden: 403,
      serverError: 500,
      notFound: 404,
      badRequest: 400,
    };
  }
}
export default new Config();
