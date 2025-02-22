import {
    GoogleDoc,
    RgbColor,
    rgbColorEquals,
    StructuralElement,
    Table,
    TableCell,
} from "./GoogleInterfaces";
import {DocAttributes, Document, NoteObject, NoteType, Track} from "../interfaces/NoteInterface";

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

export type NoteModifier = 'flat' | 'sharp'

interface RawNote {
    str: string,
    color: RgbColor,
    count: number // If this is 'A-A' this is 2. If it's 'A' it's 1
    modifier?: NoteModifier
    staccato?: boolean
    legato?: boolean
}

interface CellRuns {
    rawNotes: RawNote[]
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
            trackName = getStringFromStrEl(cell.content[0]).trim()
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
            const cellTextRun = paragraphElem.textRun
            
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
                    console.log('flat');
                    rawNotes[rawNotes.length - 1].modifier = 'flat'
                } else if (noteContents === '#') {
                    console.log('sharp');
                    rawNotes[rawNotes.length - 1].modifier = 'sharp'
                }
            } else { // Normal text
                console.log(`Normal text: ${noteContents}`);
                
                // The previous note was a modifier, so we assume this is the same note
                if (noteContents.startsWith('-')) {
                    const count = noteContents.length - 1; // Count the number of "-"
                    console.log(`notes to add to previous from '${noteContents}': ${count}`);
                    
                    rawNotes[rawNotes.length - 1].count += count
                    continue
                }
                
                let color: RgbColor = {red: 0, green: 0, blue: 0}
                
                if (cellTextRun.textStyle?.foregroundColor?.color?.rgbColor) {
                    color = cellTextRun.textStyle.foregroundColor.color.rgbColor
                    console.log('Color:', color);
                }

                let italics = cellTextRun.textStyle?.italic ?? false
                let underline = cellTextRun.textStyle?.underline ?? false
                
                console.log(`Italics: ${italics} Underline: ${underline}`);

                let splitNotes = noteContents.split(RegExp('\\s+')).filter(note => note.length > 0);
                console.log(splitNotes);
                
                // This MAY contain things with "-"
                for (let note of splitNotes) {
                    const splitByDash = note.split('-')
                    const count = (splitByDash.length - 1) + 1; // Count the number of "-" and add 1
                    
                    if (count > 1) {
                        note = splitByDash[0]
                    }
                    
                    // Staccato, legato, cont. will be verified later
                    rawNotes.push({str: note, count: count, color: color, staccato: italics, legato: underline})
                }
            }
        }
        
        cellRuns.push({rawNotes: rawNotes})
    }
    
    return {trackName: trackName, cells: cellRuns} as RowOfTableCells
}

interface MergableRow {
    trackName: string,
    cells: NoteObject[]
}

function extractDataFromTables(tables: Table[], docControls: DocAttributes): Track[] {
    const unmergedRowsMap: Map<string, MergableRow> = new Map();
    
    for (const table of tables) {
        if (!table.tableRows) continue;
        
        if (table?.columns && table?.columns !== 9) {
            console.error('Table does not have 9 columns');
            continue;
        }
        
        for (const row of table.tableRows) {
            if (!row.tableCells) continue

            let cellz = row.tableCells
            
            const processedCells = preprocessTableCells(cellz)
            console.log('Processed cells:');
            console.log(processedCells);

            let noteObjects: NoteObject[] = []
            for (let cell of processedCells.cells) {
                for (let rawNote of cell.rawNotes) {
                    let modifierCount = (rawNote.staccato ? 1 : 0) +
                        (rawNote.legato ? 1 : 0) +
                        (rawNote.str === '.' ? 1 : 0) +
                        (rawNote.count > 1 ? 1 : 0)
                    
                    if (modifierCount > 1) {
                        console.error(`Too many modifiers for note: ${rawNote}`);
                    } else {
                        let noteType: NoteType = 'normal'
                        let note = rawNote.str
                        
                        if (rawNote.staccato) {
                            noteType = 'staccato'
                        } else if (rawNote.legato) {
                            noteType = 'legato'
                        } else if (rawNote.str === '.') {
                            noteType = 'skip'
                        } else if (rawNote.count > 1) {
                            noteType = 'continuous'
                        }

                        let noteObject: NoteObject = {type: noteType}
                        
                        if (noteType !== 'skip') {
                            let octaveAdd = 0
                            
                            if (rgbColorEquals(rawNote.color, 1, 0, 0)) {
                                octaveAdd = 1
                            } else if (rgbColorEquals(rawNote.color, 0, 0, 1)) {
                                octaveAdd = -1
                            }
                            
                            let modify = ''
                            
                            if (rawNote.modifier === 'flat') {
                                modify = 'b'
                            } else if (rawNote.modifier === 'sharp') {
                                modify = '#'
                            }
                            
                            noteObject.note = `${note}${modify}${docControls.octave + octaveAdd}`
                        }
                        
                        noteObject.duration = rawNote.count
                        
                        noteObjects.push(noteObject)
                    }
                }
            }

            // Merge in the MergableRow
            const key = processedCells.trackName;
            const newRow: MergableRow = { trackName: key, cells: noteObjects };

            if (!unmergedRowsMap.has(key)) {
                unmergedRowsMap.set(key, newRow);
            } else {
                const existingRow = unmergedRowsMap.get(key);
                if (existingRow) {
                    // Perform your operation here, for example, merging cells
                    existingRow.cells.push(...newRow.cells);
                }
            }
        }
    }
    
    console.log(unmergedRowsMap);
    
    // Convert MergableRows to Track[]
    
    return Array.from(unmergedRowsMap.values()).map(row => ({
        name: row.trackName,
        metadata: {}, // TODO: Get Metadata
        notes: row.cells
    } as Track));
}

function extractControls(strElements: StructuralElement[]): DocAttributes {
    const propertyRegex = /^\s*\|\s*(Tempo|Octave|Loop)\s*:\s*([^|\n\r]+?)\s*(?:\||$)/gim;
    let match: RegExpExecArray | null;
    
    let tempo = 120
    let octave = 4
    let loop = false
    
    for (const element of strElements) {
        if (element.paragraph && element.paragraph.elements) {
            console.log('Elements:');
            console.log(element.paragraph.elements);

            for (const paraElem of element.paragraph.elements) {
                let contents = paraElem.textRun?.content
                if (!contents) continue
                
                while ((match = propertyRegex.exec(contents)) !== null) {
                    // match[1] is the property name, match[2] is the property value
                    const name = match[1];
                    const value = match[2].trim(); // remove any extra whitespace
                    
                    console.log(`Property: ${name}, Value: ${value}`);
                    
                    if (name === 'Tempo') {
                        tempo = parseInt(value.replace('BMP', ''))
                    } else if (name === 'Octave') {
                        octave = parseInt(value)
                    } else if (name === 'Loop') {
                        loop = value.toLowerCase() === 'true'
                    } else {
                        console.error(`Invalid property name found: ${value}`)
                    }
                }
            }
        }
    }
    
    return {
        tempo: tempo,
        octave: octave,
        loop: loop
    } as DocAttributes
}

/**
 * Walks the Google Docs structure to extract raw text from paragraphs.
 */
function parseDocument(docData: GoogleDoc): Document | undefined {
    if (!docData.body || !docData.body.content) {
        console.error('Document is malformed')
        return undefined
    }
    
    // Extract tables
    let tables: Table[] = [];
    for (const element of docData.body.content) {
        if (element.table) {
            tables.push(element.table);
        }
    }
    
    // Extract control attributes
    const docControls = extractControls(docData.body.content)
    
    let tableData = extractDataFromTables(tables, docControls);
    console.log('Table data:', tableData);

    console.log('Doc controls:');
    console.log(docControls);
    
    return {
        attributes: docControls,
        tracks: tableData
    } as Document
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

        const parsedDocument = parseDocument(docData);
        if (!parsedDocument) return
        
        console.log("Parsed document:");
        console.log(JSON.stringify(parsedDocument));
    } catch (err) {
        console.error("Error fetching doc:", err);
    }
}
