import fs from 'fs';
import path from 'path';

interface PdfPage {
  Texts: Array<{
    R: Array<{ T: string }>;
  }>;
}

interface PdfData {
  Pages: PdfPage[];
}

function decodeText(textItem: { R: Array<{ T: string }> }): string {
  return textItem.R
    .map((run) => {
      try {
        return decodeURIComponent(run.T);
      } catch {
        return run.T;
      }
    })
    .join('');
}

export async function extractChapterText(
  pdfFilename: string,
  pageStart: number,
  pageEnd: number
): Promise<{ pages: { pageNumber: number; text: string }[] }> {
  const pdfPath = path.join(process.cwd(), 'data', 'textbooks', pdfFilename);
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF not found: ${pdfPath}`);
  }

  const PDFParserModule = await import('pdf2json');
  const PDFParser = PDFParserModule.default;

  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(`PDF parse error: ${errData?.parserError?.message || 'Unknown error'}`));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: PdfData) => {
      try {
        const totalPages = pdfData.Pages.length;

        console.log(`[PDF DEBUG] Total pages in PDF: ${totalPages}`);
        console.log(`[PDF DEBUG] Target range: ${pageStart}-${pageEnd}`);

        const allPages: { pageNumber: number; text: string }[] = [];
        let pagesWithText = 0;
        let totalCharsExtracted = 0;

        for (let i = 0; i < totalPages; i++) {
          const page = pdfData.Pages[i];
          if (!page || !page.Texts) {
            allPages.push({ pageNumber: i + 1, text: '' });
            continue;
          }

          const pageText = page.Texts
            .map(decodeText)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          allPages.push({ pageNumber: i + 1, text: pageText });
          if (pageText.length > 0) pagesWithText++;
          totalCharsExtracted += pageText.length;
        }

        console.log(`[PDF DEBUG] Pages with text: ${pagesWithText}/${totalPages}`);
        console.log(`[PDF DEBUG] Total chars extracted: ${totalCharsExtracted}`);

        const offsets = [0, 4, 6, 8, 10, 12, 14, -2, -4];
        let bestMatch: { offset: number; pages: typeof allPages; chars: number } = {
          offset: 0,
          pages: [],
          chars: 0,
        };

        for (const offset of offsets) {
          const start = pageStart + offset;
          const end = pageEnd + offset;

          const candidate = allPages.filter(
            p => p.pageNumber >= start && p.pageNumber <= end && p.text.length > 0
          );

          const totalChars = candidate.reduce((sum, p) => sum + p.text.length, 0);

          if (totalChars > bestMatch.chars) {
            bestMatch = { offset, pages: candidate, chars: totalChars };
          }
        }

        console.log(`[PDF DEBUG] Best offset: ${bestMatch.offset}, pages: ${bestMatch.pages.length}, chars: ${bestMatch.chars}`);

        if (bestMatch.pages.length > 0 && bestMatch.chars > 500) {
          resolve({ pages: bestMatch.pages });
          return;
        }

        const sortedByContent = [...allPages]
          .filter(p => p.text.length > 50)
          .sort((a, b) => b.text.length - a.text.length)
          .slice(0, 25)
          .sort((a, b) => a.pageNumber - b.pageNumber);

        console.log(`[PDF DEBUG] Fallback: ${sortedByContent.length} pages with substantial text`);

        if (sortedByContent.length === 0) {
          const anyContent = allPages.filter(p => p.text.length > 0);
          console.log(`[PDF DEBUG] Last resort: ${anyContent.length} non-empty pages`);
          resolve({ pages: anyContent.slice(0, 30) });
          return;
        }

        resolve({ pages: sortedByContent });
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.loadPDF(pdfPath);
  });
}

export function chunkText(text: string, maxTokens: number = 500): string[] {
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim().length > 10) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length === 0 && text.length > 0) {
    const sentences = text.split(/[।.!?]+/).filter(s => s.trim().length > 5);
    let chunk = '';
    for (const sent of sentences) {
      if ((chunk + sent).length > maxChars && chunk.length > 0) {
        chunks.push(chunk.trim());
        chunk = sent;
      } else {
        chunk += (chunk ? '. ' : '') + sent;
      }
    }
    if (chunk.trim().length > 10) chunks.push(chunk.trim());
  }

  if (chunks.length === 0 && text.length > 10) {
    for (let i = 0; i < text.length; i += maxChars) {
      const chunk = text.slice(i, i + maxChars).trim();
      if (chunk.length > 10) {
        chunks.push(chunk);
      }
    }
  }

  return chunks.filter(c => c.length > 10);
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}