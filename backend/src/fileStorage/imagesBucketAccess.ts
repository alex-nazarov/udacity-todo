import * as AWS from "aws-sdk";

export class ImagesBucketAccess {

    constructor(
        private readonly s3 = new AWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly bucketName = process.env.TODOS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    async getUploadUrl(imageId: string): Promise<string> {
        console.log('getUpload URL for image: ' + imageId)

        const result = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: imageId,
            Expires: Number(this.urlExpiration)
        })
        return result
    }


}