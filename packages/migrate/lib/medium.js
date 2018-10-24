const mediumIngest = require('@tryghost/mg-medium-export');
const mgJSON = require('@tryghost/mg-json');
const MgScraper = require('@tryghost/mg-webscraper');
const converter = require('@tryghost/html-to-mobiledoc');
const fs = require('./fs');

const scrapeConfig = {
    posts: {
        tags: {
            listItem: 'ul.tags > li',
            data: {
                url: {
                    selector: 'a',
                    attr: 'href'
                },
                // @TODO ideally we'd spec this using a data key, so the structure reflects what we expect back
                name: {
                    selector: 'a'
                }
            }
        }
    }
};

const mediumScraper = new MgScraper(scrapeConfig);

/**
 * Migrate from Medium
 *
 * Wiring of the steps to migrate from medium.
 *
 * @param {String} pathToZip
 * @param {Boolean} verbose
 */
module.exports.migrate = async (pathToZip) => {
    // 1. Read the zip file
    let result = mediumIngest(pathToZip);

    // 2. Pass the results through the web scraper to get any missing data
    result = await mediumScraper.hydrate(result);

    // 3. Format the data as a valid Ghost JSON file
    result = mgJSON.toGhostJSON(result);

    // 4. Pass the JSON file through the image scraper

    // 5. Convert post HTML -> MobileDoc
    result.data.posts.forEach((post) => {
        post.mobiledoc = JSON.stringify(converter.toMobiledoc(post.html));
    });

    // 6. Write a valid Ghost import zip
    let filename = fs.writeFile(result);

    // 7. Return the path to the file
    return filename;
};
