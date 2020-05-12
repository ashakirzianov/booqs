import { search } from './search';
import { userUploadedImagesBucket } from './schema';

export const userUploads = {
    search,
};

export const userUploadsImagesRoot = `https://${userUploadedImagesBucket}.s3.amazonaws.com`;

