import { search } from './search';
import { cards, fileForId } from './lookup';
import { userUploadedImagesBucket } from './schema';

export const userUploadsLib = {
    search, cards, fileForId,
};

export const userUploadsImagesRoot = `https://${userUploadedImagesBucket}.s3.amazonaws.com`;

