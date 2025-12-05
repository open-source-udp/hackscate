import express, { Request, Response } from 'express';
import cors from 'cors';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'epauta';

// Listar archivos de una carpeta
app.get('/api/files/:folder', async (req: Request<{ folder: string }>, res: Response) => {
  try {
    const folder = req.params.folder;
    const prefix = folder.endsWith('/') ? folder : `${folder}/`;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      return res.json([]);
    }

    const files = response.Contents
      .filter((item) => item.Key && item.Key !== prefix)
      .map((item) => ({
        fileName: item.Key!.replace(prefix, ''),
        key: item.Key!,
        size: item.Size,
        lastModified: item.LastModified,
      }));

    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error al listar archivos' });
  }
});

// Descargar un archivo
app.get('/api/download', async (req: Request, res: Response) => {
  try {
    const key = req.query.key as string;
    
    if (!key) {
      return res.status(400).json({ error: 'Se requiere el parámetro key' });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const fileName = key.split('/').pop() || 'download';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    
    if (response.ContentLength) {
      res.setHeader('Content-Length', response.ContentLength);
    }

    const stream = response.Body as Readable;
    stream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
