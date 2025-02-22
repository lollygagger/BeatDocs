import {Color, GoogleDoc, RgbColor, StructuralElement, Table, TableCell, TextRun} from "./GoogleInterfaces";

/**
 * Parses a typical Google Docs URL to extract the document ID.
 * e.g., https://docs.google.com/document/d/ABCDEFG12345/edit
 */
function getDocIdFromUrl(urlString: string): string | null {
    try {
        const url = new URL(urlString);

        // Example path: /document/d/<DOC_ID>/edit
        const pathParts = url.pathname.split("/");

        // Typically: ["", "document", "d", "<DOC_ID>", "edit"]
        if (pathParts[1] === "document" && pathParts[2] === "d") {
            return pathParts[3];
        }
    } catch (err) {
        console.error("Invalid URL:", urlString, err);
    }
    return null;
}

/**
 * Fetches an OAuth token using chrome.identity.
 * interactive=true will prompt the user to grant permissions if needed.
 */
function getAuthTokenInteractive(): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            if (!token) {
                return reject(new Error("No token received."));
            }
            resolve(token);
        });
    });
}

/**
 * Fetched google doc contents via API.
 */
async function fetchGoogleDoc(token: string, docId: string): Promise<GoogleDoc> {
    const url = `https://docs.googleapis.com/v1/documents/${docId}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch doc: ${res.status} ${res.statusText}`);
    }

    const docData = (await res.json()) as GoogleDoc;
    return docData;
}

// interface RawCellPiece {
//     text?: string
//     color?: Color
//     superscript?: boolean
// }

export type NoteModifier = 'flat' | 'sharp'


interface RawNote {
    str: string,
    color: RgbColor,
    count: number // If this is 'A-A' this is 2. If it's 'A' it's 1
    modifier?: NoteModifier
}

interface CellRuns {
    runs: RawNote[]
}

interface RowOfTableCells {
    trackName: string,
    cells: CellRuns[]
}

function getStringFromStrEl(element: StructuralElement): string {
    let el = element.paragraph?.elements
    if (!el || el.length === 0) return '?'
    
    return el[0].textRun?.content ?? '?'
}

function preprocessTableCells(cells: TableCell[]) {
    // let outCells: TableCell[] = []
    
    let trackName = ''
    let cellRuns: CellRuns[] = []
    
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const cell = cells[cellIndex];
        if (!cell.content) continue;

        // outCells.push(cell)

        if (cellIndex === 0) {
            trackName = getStringFromStrEl(cell.content[0])
            console.log(`Track name: ${trackName}`);
            continue
        }

        console.log(`Cell ${cellIndex} content:`, cell.content);
        
        let rawNotes: RawNote[] = []

        const content = cell.content[0]
        let paraElements = content.paragraph?.elements
        if (!paraElements) continue;

        for (let i = 0; i < paraElements.length; i++) {
            const paragraphElem = paraElements[i];
            var cellTextRun = paragraphElem.textRun
            
            if (!cellTextRun) continue
            
            const noteContents = cellTextRun.content;
            if (!noteContents) continue;
            
            if (paragraphElem.textRun?.textStyle?.baselineOffset === 'SUPERSCRIPT') {
                if (i === 0) {
                    console.error('Superscript cant start a paragraph')
                    break
                }
                
                // this superscript will be applied to the previous text run
                
                if (noteContents === 'b') {
                    rawNotes[rawNotes.length - 1].modifier = 'flat'
                } else if (noteContents === '#') {
                    rawNotes[rawNotes.length - 1].modifier = 'sharp'
                }
            } else { // Normal text
                let color: RgbColor = {red: 0, green: 0, blue: 0}
                
                if (cellTextRun.textStyle?.foregroundColor?.color?.rgbColor) {
                    color = cellTextRun.textStyle.foregroundColor.color.rgbColor
                    console.log('Color:', color);
                }

                let splitNotes = noteContents.split(RegExp('\\s+')).filter(note => note.length > 0);
                console.log(splitNotes);
                
                // This MAY contain things with "-"
                for (let note of splitNotes) {
                    const splitByDash = note.split('-')
                    const count = (splitByDash.length - 1) + 1; // Count the number of "-" and add 1
                    
                    if (count > 1) {
                        note = splitByDash[0]
                    }
                    
                    rawNotes.push({str: note, count: count, color: color})
                }
            }
        }
        
        cellRuns.push({runs: rawNotes})
    }
    
    return {trackName: trackName, cells: cellRuns} as RowOfTableCells
}

function extractDataFromTables(tables: Table[]) {
    for (const table of tables) {
        if (!table.tableRows) continue;
        
        if (table?.columns && table?.columns !== 9) {
            console.error('Table does not have 9 columns');
            continue;
        }
        
        for (const row of table.tableRows) {
            if (!row.tableCells) continue

            let cellz = row.tableCells
            console.log('Before:');
            console.log(cellz);
            
            const preprocessed = preprocessTableCells(cellz)
            
            console.log("After:");
            console.log(preprocessed);
            
            // let notes: NoteObject[] = [];
            // let rawPieces: RawCellPiece[] = []
            // for (let cellIndex = 0; cellIndex < row.tableCells.length; cellIndex++) {
            //     const cell = row.tableCells[cellIndex];
            //     if (!cell.content) continue;
            //    
            //     if (cellIndex === 0) {
            //         console.log(`Track name: ${cell.content}`);
            //         continue
            //     }
            //    
            //     console.log(`Cell ${cellIndex} content:`, cell.content);
            //    
            //     const content = cell.content[0]
            //     let paraElements = content.paragraph?.elements
            //     if (!paraElements) continue;
            //    
            //     for (const paragraphElem of paraElements) {
            //         const noteContents = paragraphElem.textRun?.content
            //         if (!noteContents) continue
            //        
            //         let duration = 1
            //         if (noteContents.includes('-')) {
            //            
            //         }
            //     }
            //
            //     // rawPieces.push(...parseRawCallPieces(content.paragraph));
            //     // console.log(`Cell ${cellIndex} content:`, cell.content);
            // }
        }
    }
}

/**
 * Walks the Google Docs structure to extract raw text from paragraphs.
 */
function extractTextFromDoc(docData: GoogleDoc): string {
    if (!docData.body || !docData.body.content) {
        return "";
    }
    
    // Extract tables
    let tables: Table[] = [];
    for (const element of docData.body.content) {
        if (element.table) {
            tables.push(element.table);
        }
    }
    
    let tableData = extractDataFromTables(tables);
    console.log('Table data:', tableData);
    
    // Extract top control paragraphs
    
    let fullText = "";
    for (const element of docData.body.content) {
        if (element.paragraph && element.paragraph.elements) {
            for (const paraElem of element.paragraph.elements) {
                let contents = paraElem.textRun?.content
                if (contents && contents.includes('Controls')) {
                    fullText += contents;
                }
            }
        }
    }
    
    console.log('Control full text:', fullText);
    
    return fullText.trim();
}

export async function initialize(tab: string): Promise<void> {
    // Try to parse the docId from the current tab's URL
    const docId = getDocIdFromUrl(tab);
    if (!docId) {
        console.log("Not a valid Google Docs URL or docId not found.");
        return;
    }

    try {
        // Request an OAuth token (this may prompt the user if not already granted)
        const token = await getAuthTokenInteractive();

        const docData = await fetchGoogleDoc(token, docId);

        const textContent = extractTextFromDoc(docData);
        console.log("Extracted text:", textContent);
    } catch (err) {
        console.error("Error fetching doc:", err);
    }
}
