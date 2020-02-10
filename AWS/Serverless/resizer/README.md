# Serverless Resizer

A serverless image resizer and format converter based on Node.JS, Lambda and API Gateway

## Lambda

### Node installation
Install node modules
```bash
docker run --rm -v "$PWD/lambda":/opt -w /opt node:12 npm install
```

### Examples to run
```bash
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler '{"queryStringParameters": {"image": "https://google.com/x.jpg"}}'
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler '{"queryStringParameters": {"image": "https://google.com/x.jpg", "size": "1000x1000"}}'
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler '{"queryStringParameters": {"image": "https://dummyimage.com/1920x1080/592159/fcc121.jpg", "size": "1000x1000"}}'
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler '{"queryStringParameters": {"image": "https://dummyimage.com/1920x1080/592159/fcc121.jpg", "size": "1000x1000", "format": "webp"}}'
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler '{"queryStringParameters": {"image": "https://dummyimage.com/1920x1080/592159/fcc121.jpg", "format": "webp"}}'
docker run --rm -v "$PWD/lambda":/var/task:ro,delegated lambci/lambda:nodejs12.x index.handler '{"queryStringParameters": {"image": "https://dummyimage.com/1920x1080/592159/fcc121.jpg", "size": "x1000"}}'
```

## CloudFormation
Defines a basic configuration for creating the API Gateway and the Lambda function.

Create a deployment package for the Lambda function
```bash
cd lambda
zip -r ../cloudFormation/resizer.zip *
```

Upload the `resizer.zip` to `acilia` Bucket to path `labs/AWS/Serverless/resizer/resizer.zip` and make sure is public.

On the API Gateway you can test with querystring:
`?image=https://dummyimage.com/1920x1080/592159/fcc121.jpg&size=1000x1000&format=webp`