class Config {
    public elasticSearch: { url: string | undefined };
    
    constructor(){
        this.elasticSearch = {
            url : process.env.ELASTICSEARCH_URL}
    }
}
export default new Config();