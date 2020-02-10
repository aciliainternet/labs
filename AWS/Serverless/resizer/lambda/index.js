console.log('Loading Resizer');

const request = require('request');
const sharp = require('sharp');

// Define Resizer options
const resizerOptions = {
    cache: {
        maxAge: 3600*24*365
    }
};

exports.handler = function(event, context, callback) {
    // Check payload
    console.log('Received event:', JSON.stringify(event, null, 2));
    if (event.queryStringParameters.image === undefined) {
        console.error('Parameter image is not defined');
        callback(null, {
            'isBase64Encoded': false,
            'statusCode': 400,
            'body': 'Parameter image is not defined'
        });
        return;
    }

    if (event.queryStringParameters.size === undefined && event.queryStringParameters.format === undefined) {
        console.error('Parameters size or format are not defined');
        callback(null, {
            'isBase64Encoded': false,
            'statusCode': 400,
            'body': 'Parameters size or format are not defined'
        });
        return;
    }

    // Define Resizer runtime properties
    let resizer = {
        originalImageUrl: event.queryStringParameters.image,
        originalImageWidth: null,
        originalImageHeight: null,
        originalAspectRatio: null,
        newSize: event.queryStringParameters.size !== undefined ? event.queryStringParameters.size : null,
        newFormat: event.queryStringParameters.format !== undefined ? event.queryStringParameters.format : null
    };

    // Check if new sizes needed
    if (resizer.newSize !== null) {
        resizer.newSizeWidth = resizer.newSize.split('x')[0] !== '' ? parseInt(resizer.newSize.split('x')[0]) : null;
        resizer.newSizeHeight = resizer.newSize.split('x')[1] !== '' ? parseInt(resizer.newSize.split('x')[1]) : null;
    }

    console.log('Processing image:', event.image);
    request({ url: resizer.originalImageUrl, encoding: null }, (err, resp, buffer) => {
        if (resp.statusCode !== 200) {
            console.error('Unable to get image, Status Code', resp.statusCode);
            callback(null, {
                'isBase64Encoded': false,
                'statusCode': 400,
                'body': 'The image requested is not available'
            });
            return;
        }

        const image = sharp(buffer);
        image
            .metadata()
            .then(function(metadata) {
                console.debug('Original image metadata', metadata);
                let mimeType = 'image/' + metadata.format;

                resizer.originalImageWidth = metadata.width;
                resizer.originalImageHeight = metadata.height;
                resizer.originalAspectRatio = resizer.originalImageWidth / resizer.originalImageHeight;

                // If new width is not defined, calculate based on aspect ratio
                if (resizer.newSizeWidth === null && resizer.newSizeHeight !== null) {
                    resizer.newSizeWidth = parseInt(resizer.newSizeHeight * resizer.originalAspectRatio);
                }

                // If new height is not defined, calculate based on aspect ratio
                if (resizer.newSizeHeight === null && resizer.newSizeWidth !== null) {
                    resizer.newSizeHeight = parseInt(resizer.newSizeWidth / resizer.originalAspectRatio);
                }

                // Final resizer options
                console.debug('Resizer options', resizer);


                // Configure Sharp
                let sharpResizeOptions = { width: metadata.width, height: metadata.height };
                if (resizer.newSizeWidth !== null && resizer.newSizeHeight !== null) {
                    sharpResizeOptions.width = resizer.newSizeWidth;
                    sharpResizeOptions.height = resizer.newSizeHeight;
                }

                let sharpFormat = metadata.format;
                if (resizer.newFormat !== null) {
                    image.toFormat(resizer.newFormat);
                    mimeType = 'image/' + resizer.newFormat;
                }

                // Generate
                image
                    .resize(sharpResizeOptions)
                    .toFormat(sharpFormat)
                    .toBuffer()
                    .then(data => {
                        callback(null, {
                            'isBase64Encoded': true,
                            'statusCode': 200,
                            'headers': {
                                'Cache-Control': 'public, max-age=' + resizerOptions.cache.maxAge,
                                'Content-Type': mimeType,
                            },
                            'body': data.toString('base64')
                        });
                    });
            });
    });
};