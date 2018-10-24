const _ = require('lodash');
const scrapeIt = require('scrape-it');

class Scraper {
    constructor(config) {
        this.config = config;
    }

    mergeRelations (relations) {
        return relations.map(item => {
            if (!item.url) {
                return item;
            }

            let newItem = { url: item.url };
            delete item.url;
            newItem.data = item;
            return newItem;
        });
    }

    mergeResource (resource) {
        return ({ data, response }) => {
            if (response.statusCode > 299) {
                return resource;
            }
            _.each(data, (field, name) => {
                if (_.isArray(field)) {
                    resource[name] = this.mergeRelations(field);
                } else {
                    resource[name] = field;
                }
            });

            return resource;
        }
    }

    async hydrate(data) {
        let scrapeFns = [];

        // We only handle posts ATM, escape if there's nothing to do
        if (!this.config.posts || !data.posts || data.posts.length === 0) {
            return data;
        }

        scrapeFns = data.posts.map(({ url, data }) => {
            return scrapeIt(url, this.config.posts)
                .then(this.mergeResource(data));
        });

        return Promise
            .all(scrapeFns)
            .then(() => {
                return data;
            })
            .catch((err) => {
                // @TODO: handle errors
                console.error(err.stack);
            });
    }
}

module.exports = Scraper;
