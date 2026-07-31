import { ConfigService } from "@nestjs/config";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ENV_KEYS, STORAGE_CONFIGS } from "@repo/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService {
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const minioConfig: S3ClientConfig = {
      region: this.configService.getOrThrow(ENV_KEYS.MINIO_REGION),
      endpoint: this.configService.getOrThrow(ENV_KEYS.MINIO_ENDPOINT_URL),
      credentials: {
        accessKeyId: this.configService.getOrThrow(ENV_KEYS.MINIO_ACCESS_KEY),
        secretAccessKey: this.configService.getOrThrow(
          ENV_KEYS.MINIO_SECRET_KEY,
        ),
      },
      forcePathStyle: true,
    };

    this.client = new S3Client(minioConfig);
  }

  async generateUploadUrl(objectKey: string, contentType: string) {
    console.log("bucket", this.configService.getOrThrow(ENV_KEYS.MINIO_BUCKET));

    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow(ENV_KEYS.MINIO_BUCKET),
      Key: objectKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: STORAGE_CONFIGS.UPLOAD_URL_EXPIRATION_SECONDS,
    });

    return {
      signedUrl,
      expiresIn: STORAGE_CONFIGS.UPLOAD_URL_EXPIRATION_SECONDS,
    };
  }

  async generateDownloadUrl(objectKey: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow(ENV_KEYS.MINIO_BUCKET),
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: STORAGE_CONFIGS.DOWNLOAD_URL_EXPIRATION_SECONDS,
    });

    return {
      signedUrl,
      expiresIn: STORAGE_CONFIGS.DOWNLOAD_URL_EXPIRATION_SECONDS,
    };
  }

  async deleteObject(objectKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow(ENV_KEYS.MINIO_BUCKET),
      Key: objectKey,
    });
    await this.client.send(command);
  }

  async objectExists(objectKey: string) {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.configService.getOrThrow(ENV_KEYS.MINIO_BUCKET),
          Key: objectKey,
        }),
      );

      return true;
      //   eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (
        error?.name === "NotFound" ||
        error?.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }

      throw error;
    }
  }
}
