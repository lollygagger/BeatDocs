export interface TabbedGoogleDoc {
    tabs: DocTab[]
}

export interface DocTab {
    documentTab: DocumentTab,
    tabProperties: TabProperties
}

export interface DocumentTab {
    body?: {
        // The document body contains an array of StructuralElements.
        content?: StructuralElement[];
    };
}

export interface TabProperties {
    index: number,
    tabId: string,
    title: string
}

// A StructuralElement is a union of possible element types.
export interface StructuralElement {
    paragraph?: Paragraph;
    table?: Table;
    tableOfContents?: TableOfContents;
    // There are other types (e.g. sectionBreak) but these are common.
}

// Represents a paragraph.
export interface Paragraph {
    elements?: ParagraphElement[];
    paragraphStyle?: ParagraphStyle;
}

// An element within a paragraph.
export interface ParagraphElement {
    // A text run is a run of text with a uniform style.
    textRun?: TextRun;
    // Other inline objects (like inline images) can be added here.
}


// A run of text and its styling.
export interface TextRun {
    content?: string;
    textStyle?: TextStyle;
}

// Represents text style formatting.
export interface TextStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    foregroundColor?: ForegroundColor;
    baselineOffset?: string;
    // More text style properties can be added as needed.
}

export interface ForegroundColor {
    color?: Color;
} 

export interface Color {
    // An RGB color.
    rgbColor?: RgbColor;
}

export interface RgbColor {
    red?: number;
    green?: number;
    blue?: number;
}

export function rgbColorEquals(rgbColor: RgbColor, red: number, green: number, blue: number) {
    let realRed = rgbColor.red ?? 0
    let realGreen = rgbColor.green ?? 0
    let realBlue = rgbColor.blue ?? 0
    
    return realRed === red && realGreen === green && realBlue === blue;
}

// Styling information for a paragraph.
export interface ParagraphStyle {
    alignment?: "START" | "CENTER" | "END" | "JUSTIFIED";
    // Tab stops allow you to define positions for tab characters.
    tabStops?: TabStop[];
    // Other paragraph style fields (indentation, spacing, etc.) can be added.
}

// Represents a tab stop.
export interface TabStop {
    // Alignment of text relative to the tab stop (LEFT, CENTER, RIGHT, DECIMAL).
    alignment?: "LEFT" | "CENTER" | "RIGHT" | "DECIMAL";
    // The offset of the tab stop, in points (or other units as documented).
    offset?: number;
    // The leader (if any) for the tab stop (e.g. dots or dashes).
    leader?: string;
}

// Represents a table.
export interface Table {
    // Total number of columns and rows.
    columns?: number;
    rows?: number;
    // The actual rows of the table.
    tableRows?: TableRow[];
    // Optional styling information for the table.
    tableStyle?: TableStyle;
}

// A row in a table.
export interface TableRow {
    tableCells?: TableCell[];
}

// A cell in a table.
export interface TableCell {
    // Each cell contains its own array of StructuralElements,
    // which may include paragraphs, nested tables, etc.
    content?: StructuralElement[];
    // You could also add cell-specific style information.
}

// (Optional) Table style information.
export interface TableStyle {
    // Define any style properties as needed.
    // For example, border styles, cell background colors, etc.
}

// Represents a table of contents.
export interface TableOfContents {
    // A table of contents is itself composed of structural elements.
    content?: StructuralElement[];
}
