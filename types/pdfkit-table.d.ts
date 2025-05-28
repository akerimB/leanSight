declare module 'pdfkit-table' {
  import PDFDocument from 'pdfkit';
  
  interface Table {
    title?: string;
    subtitle?: string;
    headers?: string[];
    rows: string[][];
    divider?: {
      header?: { disabled?: boolean; width?: number; opacity?: number };
      horizontal?: { disabled?: boolean; width?: number; opacity?: number };
    };
  }
  
  interface TableOptions {
    width?: number;
    x?: number;
    y?: number;
    divider?: any;
    prepareHeader?: () => void;
    prepareRow?: (row: string[], i: number) => void;
    padding?: number;
    columnSpacing?: number;
    hideHeader?: boolean;
  }

  class PDFDocumentWithTable extends PDFDocument {
    table(table: Table, options?: TableOptions): Promise<void>;
  }
  
  // This exports a constructor function
  const PDFDocumentTableConstructor: typeof PDFDocumentWithTable;
  export = PDFDocumentTableConstructor;
} 