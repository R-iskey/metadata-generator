const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const path = require('path');
const scanImagesPath = require('./scanImagesPath');
const {last, nth, first} = require('lodash');
const prompt = require('prompt');
const Metadata = require('./Metadata');

function main() {
    program
        .name('metadata-generator')
        .description('Generate a metadata based on uploaded images')
        .version('0.1.0');
    
    const properties = [
        {
            name: 'baseUri',
            validator: /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            warning: 'Base Uri must be a valid uri',
            required: true,
            description: 'Enter Base Uri (required)'
        },
        {
            name: 'description',
            required: true,
            description: 'Write the description for your metadata files'
        },

    ];
    
    prompt.start();
    prompt.get(properties, (err, result) => {
        if (err) {
            console.log(err);
            return 1;
        }
        run(result);
    });
}

function cleanBaseUri(baseUri) {
    if (baseUri.slice(-1) !== '/') {
        return baseUri + '/'
    }
    return baseUri;
}

async function run(result) {
    const {baseUri, description} = result;
    
    const baseURI = cleanBaseUri(baseUri);
    
    const images = await scanImagesPath(path.join(__dirname, 'images'));
    
    console.log(`-- Image folder scanned, found: ${images.length} items --`);
    
    const metadata = images
        .map((fileName, index) => {
            const withoutExt = first(fileName.split('.'));
            const ext = last(fileName.split('.'));
            
            const groupName = nth(withoutExt.split(path.sep), -2);
            const shortName = last(withoutExt.split(path.sep));
            
            const meta = new Metadata(
                shortName,
                description,
                `${baseURI}${shortName}.${ext}`,
                [
                    {
                        trait_type: 'group',
                        value: groupName
                    }
                ]
            );
    
            fs.writeFileSync(
                path.join(__dirname, 'metadata', `${index + 1}.json`),
                JSON.stringify(meta, null, 2)
            );
            
            return meta;
        })
    
    const hiddenMeta = new Metadata(
        'hidden',
        description,
        `${baseURI}hidden.png`,
    )
    fs.writeFileSync(
        path.join(__dirname, 'metadata', 'hidden.json'),
        JSON.stringify(hiddenMeta, null, 2)
    );
    
    console.log(`-- Metadata files generated, count: ${metadata.length} items --`);
}

main();
