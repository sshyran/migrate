const converter = require('@tryghost/html-to-mobiledoc');

// Wrap our converter tool and convert to a string
const convertPost = (post) => {
    post.mobiledoc = JSON.stringify(converter.toMobiledoc(post.html));
    delete post.html;
};

// Understands the data formats, so knows where to look for posts to convert
module.exports.convert = (ctx) => {
    let res = ctx.result;
    let posts = res.posts;

    if (!posts && res.data && res.data.posts) {
        posts = res.data.posts;
    }

    let tasks = posts.map((post) => {
        return {
            title: `Converting ${post.title}`,
            task: () => {
                try {
                    convertPost(post);
                } catch (error) {
                    let convertError = new Error(`Unable to convert post ${post.title}`);
                    convertError.reference = post.slug;
                    convertError.originalError = error;

                    ctx.errors.push(convertError);
                    throw convertError;
                }
            }
        };
    });

    return tasks;
};
