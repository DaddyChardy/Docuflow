import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Set worker source for PDF.js
// In Vite, this often needs to be copied to public or imported specifically.
// For simplicity in this environment, we'll try the CDN approach or standard import if configured.
// If this fails, we might need to adjust based on the build system.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const parseFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return await parsePdf(file);
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.docx')
        ) {
            return await parseDocx(file);
        } else {
            // Default to text
            return await file.text();
        }
    } catch (error) {
        console.error(`Error parsing file ${file.name}:`, error);
        throw new Error(`Failed to parse file: ${(error as Error).message}`);
    }
};

const parsePdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            // @ts-ignore
            .map((item) => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText;
};

const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // We use convertToHtml to preserve tables, lists, and headings
    // This provides much better context for the AI than raw text
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value || "";
};

/**
 * Merges HTML content into a DOCX template's body while preserving headers/footers.
 * This is a simplified implementation that replaces the text in word/document.xml.
 * NOTE: For full HTML-to-DOCX conversion preservation, a library like html-to-docx or
 * similar would be better, but we leverage SuperDoc for the final editing.
 */
export const mergeContentIntoTemplate = async (templateBlob: Blob, htmlContent: string): Promise<Blob> => {
    const zip = await JSZip.loadAsync(templateBlob);

    // In a DOCX, the main content is in word/document.xml
    let documentXml = await zip.file("word/document.xml")?.async("string");

    if (!documentXml) {
        throw new Error("Invalid DOCX: Exactly one word/document.xml file is required.");
    }

    // This is a naive injection. 
    // SuperDoc is better at handling the "merging" if we load the template 
    // and then insert content via its own API.
    // However, if we want to ensure headers/footers are there from the start:

    // Return the original template for now, and handle the "injection" inside the component using SuperDoc API
    // because injecting raw HTML into DOCX XML requires complex conversion (altChunk or manual XML generation).
    return templateBlob;
};
