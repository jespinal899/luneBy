import { request as httpsRequest } from 'https';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface HttpResult {
  status: number;
  body: string;
}

/**
 * Sube imágenes a Supabase Storage vía su API REST (sin SDK).
 * Activo solo si `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están definidas.
 *
 * Usa el módulo `https` nativo (no `fetch`) y fuerza IPv4: en algunos hosts
 * (p. ej. Render) la resolución IPv6 hacia Supabase falla con «fetch failed».
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

  private send(
    target: string,
    method: string,
    contentType: string,
    body: Buffer,
  ): Promise<HttpResult> {
    const { hostname, pathname } = new URL(target);
    return new Promise((resolve, reject) => {
      const req = httpsRequest(
        {
          hostname,
          path: pathname,
          method,
          family: 4,
          headers: {
            Authorization: `Bearer ${this.key}`,
            'Content-Type': contentType,
            'Content-Length': body.length,
            'x-upsert': 'true',
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () =>
            resolve({
              status: res.statusCode ?? 0,
              body: Buffer.concat(chunks).toString('utf8'),
            }),
          );
        },
      );
      req.on('error', reject);
      req.end(body);
    });
  }

  /** Crea el bucket público la primera vez (idempotente). */
  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return;
    await this.send(
      `${this.url}/storage/v1/bucket`,
      'POST',
      'application/json',
      Buffer.from(
        JSON.stringify({ id: this.bucket, name: this.bucket, public: true }),
      ),
    ).catch(() => undefined); // si ya existe, se ignora
    this.bucketReady = true;
  }

  /** Sube el buffer y devuelve la URL pública permanente. */
  async upload(
    path: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.ensureBucket();

    const res = await this.send(
      `${this.url}/storage/v1/object/${this.bucket}/${path}`,
      'POST',
      contentType,
      body,
    );

    if (res.status < 200 || res.status >= 300) {
      this.logger.error(`Supabase Storage ${res.status}: ${res.body}`);
      throw new InternalServerErrorException(
        `Supabase Storage ${res.status}: ${res.body}`,
      );
    }

    return `${this.url}/storage/v1/object/public/${this.bucket}/${path}`;
  }
}
