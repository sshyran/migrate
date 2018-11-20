const baseTemplate = require('./base-template');
const stripMeta = require('./strip-meta');
const processPostRelations = require('./process-post-relations');

module.exports = (input) => {
    // Construct a basic Ghost JSON template
    let output = baseTemplate();

    // Process relationships from nested form
    output.data = processPostRelations(input);

    // Strip any meta data from the input / flatten structures
    output.data = stripMeta(output.data);

    return output;
};
