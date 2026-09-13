import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { unicodeToDlManel, dlManelToUnicode } from "./converterLogic";

export async function exportToDocx(inputText: string, mode: "unicode-to-legacy" | "legacy-to-unicode", customFontName?: string, overrides?: Array<{ find: string, replace: string }>, profile?: "DL_SERIES" | "FM_SERIES") {
    const paragraphs = inputText.split('\n').map(line => {
        if (!line) {
            return new Paragraph({ children: [] });
        }

        const runs: TextRun[] = [];

        if (mode === "legacy-to-unicode") {
            const converted = dlManelToUnicode(line, overrides, profile);
            runs.push(new TextRun({
                text: converted,
                font: "Iskoola Pota",
                size: 24, // 12pt
            }));
        } else {
            // Split line by English/numbers/spaces vs Sinhala
            const chunks = line.split(/([a-zA-Z0-9]+(?:[\s\.!?,;:''"()\[\]{}]+[a-zA-Z0-9]+)*)/);
            
            for (const chunk of chunks) {
                if (!chunk) continue;
                
                if (/[a-zA-Z0-9]/.test(chunk)) {
                    runs.push(new TextRun({
                        text: chunk,
                        font: {
                            name: "Arial",
                            ascii: "Arial",
                            hAnsi: "Arial",
                            cs: "Arial",
                            eastAsia: "Arial"
                        },
                        size: 24, // 12pt
                    }));
                } else {
                    const converted = unicodeToDlManel(chunk, overrides, profile);
                    const legacyFont = customFontName || "DL-Manel";
                    runs.push(new TextRun({
                        text: converted,
                        font: {
                            name: legacyFont,
                            ascii: legacyFont,
                            hAnsi: legacyFont,
                            cs: legacyFont,
                            eastAsia: legacyFont
                        },
                        size: 28, // 14pt (slightly larger for DL-Manel readability)
                    }));
                }
            }
        }

        return new Paragraph({
            children: runs,
        });
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: paragraphs,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Sinhala_Converted_${mode === "unicode-to-legacy" ? "DL-Manel" : "Unicode"}.docx`);
}
