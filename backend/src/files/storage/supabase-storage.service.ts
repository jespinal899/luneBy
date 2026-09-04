import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Sube imágenes a Supabase Storage vía su API REST (sin SDK).
 * Activo solo si `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están definidas.
 */
@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger('SupabaseStorage');
  private readonly url = this.config.get<string>('SUPABASE_URL');
  private readonly key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
  private readonly bucket =
    this.config.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'service-images';
  private bucketReady = false;

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.url && this.key);
  }

  /** Crea el bucket público la primera vez (idempotente). */
  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return;
    await fetch(`${this.url}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.bucket,
        name: this.bucket,
        public: true,
      }),
    }).catch(() => undefined); // si ya existe, se ignora
    this.bucketReady = true;
  }

  /** Sube el buffer y devuelve la URL pública permanente. */
  async upload(
    path: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.ensureBucket();

    const res = await fetch(
      `${this.url}/storage/v1/object/${this.bucket}/${path}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: new Uint8Array(body),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Supabase Storage ${res.status}: ${body}`);
      throw new InternalServerErrorException(
        `Supabase Storage ${res.status}: ${body}`,
      );
    }

    return `${this.url}/storage/v1/object/public/${this.bucket}/${path}`;
  }
}
