import { randomUUID } from 'node:crypto'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { exportLinks } from '@/app/functions/link'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/infra/shared/either'
import * as upload from '@/infra/storage/upload-to-storage'
import { makeLinkUpload } from '@/test/factories/make-upload'

describe('export uploads', () => {
  beforeAll(async () => {
    await db.delete(schema.links)
  })
  it('should be able to export uploads', async () => {
    const linkUploadStub = vi
      .spyOn(upload, 'uploadFileToStorage')
      .mockImplementation(async () => {
        return {
          key: `${randomUUID()}.csv`,
          url: 'https://example.com/test.csv',
        }
      })

    // const shortUrlPattern = randomUUID()

    const link5 = await makeLinkUpload()
    const link4 = await makeLinkUpload()
    const link3 = await makeLinkUpload()
    const link2 = await makeLinkUpload()
    const link1 = await makeLinkUpload()

    const sut = await exportLinks()

    const generatedCSVStream = linkUploadStub.mock.calls[0][0].contentStream

    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []
      generatedCSVStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      generatedCSVStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'))
      })
      generatedCSVStream.on('error', error => {
        reject(error)
      })
    })
    const csvAsArray = csvAsString
      .trim()
      .split('\n')
      .map(line => line.split(','))

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      reportUrl: 'https://example.com/test.csv',
    })
    expect(csvAsArray).toEqual([
      ['ID', 'Original URL', 'Short URL', 'Access Count', 'Created at'],
      [
        link1.id,
        link1.url,
        link1.shortUrl,
        expect.any(String),
        expect.any(String),
      ],
      [
        link2.id,
        link2.url,
        link2.shortUrl,
        expect.any(String),
        expect.any(String),
      ],
      [
        link3.id,
        link3.url,
        link3.shortUrl,
        expect.any(String),
        expect.any(String),
      ],
      [
        link4.id,
        link4.url,
        link4.shortUrl,
        expect.any(String),
        expect.any(String),
      ],
      [
        link5.id,
        link5.url,
        link5.shortUrl,
        expect.any(String),
        expect.any(String),
      ],
    ])
  })
})
