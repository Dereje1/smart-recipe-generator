/**
 * @jest-environment node
 */
import nock from 'nock';
import { S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { uploadImagesToS3, uploadAudioToS3 } from "../../src/lib/awss3";

describe('Uploading images to S3', () => {
    let mockS3Client: any;

    // Sample images to upload
    const imagesToUpload = [{
        originalImgLink: 'https://openai-img-link-1/',
        userId: 'mockUserId',
        location: 'location-1'
    }, {
        originalImgLink: 'https://openai-img-link-2/',
        userId: 'mockUserId',
        location: 'location-2'
    }];

    beforeEach(() => {
        // Set environment variables
        process.env = {
            ...process.env,
            S3_BUCKET_NAME: 'stub-bucket-name',
            AWS_ACCESS_KEY_ID: 'stub-accesskey',
            AWS_SECRET_ACCESS_KEY: 'stub-secret-key',
        };

        // Mock AWS S3 client
        mockS3Client = mockClient(S3Client);

        // Mocking default endpoints
        nock('https://openai-img-link-1')
            .get('/')
            .reply(200, 'Processed Image data 1');

        nock('https://openai-img-link-2')
            .get('/')
            .reply(200, 'Processed Image data 2');
    });

    afterEach(() => {
        // Clean up nock interceptors
        nock.cleanAll();
    });

    it('will upload the images to S3 successfully', async () => {
        // Call the function to upload images
        const ans = await uploadImagesToS3(imagesToUpload);

        // Extract call arguments from the mock
        const [params1, params2] = mockS3Client.send.args;

        // Validate the parameters for the first image upload
        expect(params1[0].input).toEqual({
            Bucket: 'stub-bucket-name',
            Key: 'location-1',
            Body: Buffer.from('Processed Image data 1'),
            ContentType: 'image/png',
            Tagging: 'userId=mockUserId',
            CacheControl: "public, max-age=2592000",
        });

        // Validate the parameters for the second image upload
        expect(params2[0].input).toEqual({
            Bucket: 'stub-bucket-name',
            Key: 'location-2',
            Body: Buffer.from('Processed Image data 2'),
            ContentType: 'image/png',
            Tagging: 'userId=mockUserId',
            CacheControl: "public, max-age=2592000",
        });

        // Validate the returned result
        expect(ans).toEqual([
            { location: 'location-1', uploaded: true },
            { location: 'location-2', uploaded: true }
        ]);
    });

    it('will handle failures in processing images', async () => {
        // Clean existing mocks and set new erroneous endpoints
        nock.cleanAll();
        nock('https://openai-img-link-3')
            .get('/')
            .reply(200, 'Processed Image data 1');

        nock('https://openai-img-link-4')
            .get('/')
            .reply(200, 'Processed Image data 2');

        // Call the function to upload images
        const ans = await uploadImagesToS3(imagesToUpload);

        // Validate the returned result in case of failure
        expect(ans).toEqual([
            { location: 'location-1', uploaded: false },
            { location: 'location-2', uploaded: false }
        ]);
    });

    it('will handle error if no img link sent', async () => {
        // Update the image objects to have no original image links
        const updatedImagesToUpload = imagesToUpload.map(image => ({ ...image, originalImgLink: '' }));

        // Call the function to upload images
        const result = await uploadImagesToS3(updatedImagesToUpload);

        // Validate the returned result in case of missing image links
        expect(result).toEqual([
            { location: 'location-1', uploaded: false },
            { location: 'location-2', uploaded: false }
        ]);
    });

    it('will handle error if s3client cannot be configured', async () => {
        // Update environment variables to simulate configuration error
        process.env = {
            ...process.env,
            S3_BUCKET_NAME: 'stub-bucket-name',
            AWS_ACCESS_KEY_ID: undefined,
            AWS_SECRET_ACCESS_KEY: 'stub-secret-key',
        };

        // Call the function to upload images
        const result = await uploadImagesToS3(imagesToUpload);

        // Validate the returned result in case of configuration error
        expect(result).toEqual([
            { location: 'location-1', uploaded: false },
            { location: 'location-2', uploaded: false }
        ]);
    });
});

describe('Uploading audio to S3', () => {
    let mockS3Client: any;

    // Sample audio to upload
    const audioMock = {
        audioBuffer: Buffer.from('mock buffer'),
        fileName: 's3-audio-key',
    }

    beforeEach(() => {
        // Set environment variables
        process.env = {
            ...process.env,
            S3_BUCKET_NAME: 'stub-bucket-name',
            AWS_ACCESS_KEY_ID: 'stub-accesskey',
            AWS_SECRET_ACCESS_KEY: 'stub-secret-key',
        };

        // Mock AWS S3 client
        mockS3Client = mockClient(S3Client);
    });

    it('will upload the audio to S3 successfully', async () => {
        // Call the function to upload images
        const ans = await uploadAudioToS3(audioMock);

        // Extract call arguments from the mock
        const [params1] = mockS3Client.send.args;

        // Validate the parameters for the first image upload
        expect(params1[0].input).toEqual({
            Bucket: 'stub-bucket-name',
            Key: 'audio/s3-audio-key',
            Body: Buffer.from('mock buffer'),
            ContentType: 'audio/mpeg',
            CacheControl: "public, max-age=2592000",
        });

        expect(ans).toBe('https://stub-bucket-name.s3.us-east-1.amazonaws.com/audio/s3-audio-key')
    });

    it('will handle error if s3client cannot be configured', async () => {
        // Update environment variables to simulate configuration error
        process.env = {
            ...process.env,
            S3_BUCKET_NAME: 'stub-bucket-name',
            AWS_ACCESS_KEY_ID: undefined,
            AWS_SECRET_ACCESS_KEY: 'stub-secret-key',
        };
        try {
            // Call the function to upload images
           await uploadAudioToS3(audioMock);;
        } catch (error) {
            expect(error).toEqual(new Error('Failed to upload audio to S3: Error: Unable to configure S3'))
        }
    });
});