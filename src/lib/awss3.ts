import * as https from 'https';
import { Transform as Stream } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';
import { UploadReturnType } from '../types';

// Define an interface for the upload parameters
interface UploadToS3Type {
    originalImgLink: string | undefined;
    userId: string | undefined;
    location: string;
}

// Function to process the image from the URL and return it as a stream
export const processImage = (url: string): Promise<StreamingBlobPayloadInputTypes> =>
    new Promise((resolve, reject) => {
        const request = https.request(url, (response) => {
            const data = new Stream();
            response.on('data', (chunk: Buffer) => {
                data.push(chunk);
            });

            response.on('end', () => {
                resolve(data.read());
            });
        });

        request.on('error', (err: string) => {
            reject(err);
        });
        request.end();
    });

// Function to configure the S3 client
export const configureS3 = () => (
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            region: 'us-east-1',
        })
        : null
);

// Function to upload a single image to S3
export const uploadImageToS3 = async ({
    originalImgLink,
    userId,
    location
}: UploadToS3Type): Promise<UploadReturnType> => {
    try {
        if (!originalImgLink) throw new Error('Image link is undefined');

        const s3 = configureS3();
        if (!s3) throw new Error('Unable to configure S3');

        const Body = await processImage(originalImgLink);

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: location,
            Body,
            ContentType: 'image/png',
            Tagging: `userId=${userId}`,
        });
        s3.send(command);
        return {
            location,
            uploaded: true
        }
    } catch (error) {
        console.error(`Error uploading image. ${originalImgLink?.slice(0, 50)}... - ${error}`);
        return {
            location,
            uploaded: false
        };
    }
};

// Function to upload multiple images to S3
export const uploadImagesToS3 = async (openaiImagesArray: UploadToS3Type[]): Promise<UploadReturnType[] | null> => {
    try {
        const imagePromises: Promise<UploadReturnType>[] = openaiImagesArray.map(img => uploadImageToS3(img));
        const results = await Promise.all(imagePromises);
        return results;
    } catch (error) {
        console.error(error);
        return null;
    }
};
