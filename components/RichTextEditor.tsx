
import React, { useEffect, useRef, useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Undo, Redo, Copy, Check, Printer, Maximize2, Minimize2, X
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  // Update content when initialContent (generated text) changes
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    checkHeight();
  };

  const checkHeight = () => {
    if (editorRef.current) {
        // A4 height in pixels approx 1123px (at 96 DPI)
        const height = editorRef.current.clientHeight;
        const pages = Math.ceil((height + 200) / 1123); // +200 for header/margins
        if (pages !== pageCount) setPageCount(pages > 0 ? pages : 1);
    }
  }

  const handleCopy = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('document-paper-wrapper');
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'width=900,height=1200');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { margin: 0; size: A4; }
              body { -webkit-print-color-adjust: exact; margin: 0; }
              /* Ensure thead and tfoot repeat on every page */
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
              /* Hide visual page gaps for print */
              #document-paper-wrapper {
                 background-image: none !important;
                 background-color: white !important;
                 box-shadow: none !important;
                 margin: 0 !important;
                 padding: 10mm !important;
                 width: 100% !important;
                 min-height: auto !important;
              }
              /* Content adjustment */
              td { vertical-align: top; }
              
              /* Force table borders in print */
              table, th, td {
                border-collapse: collapse;
              }
              .border-table td, .border-table th {
                border: 1px solid black !important;
              }
            }
          </style>
        </head>
        <body class="bg-white">
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const ToolbarButton = ({ icon: Icon, cmd, arg, title }: any) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        execCommand(cmd, arg);
      }}
      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const DocumentHeader = () => (
    <div className="flex flex-col items-center text-center font-serif border-b-2 border-blue-900/80 pb-4 mb-8 w-full select-none" contentEditable={false}>
      <div className="mb-2 flex items-center justify-center">
          <img 
            src="https://scontent.ftdg1-1.fna.fbcdn.net/v/t39.30808-6/323766341_1815321958848574_2117577963714806811_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeF0pB7omAB0Hs0EpFMi_0gZwAVcbrVbqabABVxutVuppqcF0Aueh0wANR0alAlX-J6jLjEcX8e9d1vbkNISXj3N&_nc_ohc=gMfzxv9KRkcQ7kNvwFcFgqa&_nc_oc=AdlGXE4dig6-cPjQUBih7VKi_-gxfr7zNKSq47IMZGPNpEAOamq7DdbcNwyO6YLSKdg&_nc_zt=23&_nc_ht=scontent.ftdg1-1.fna&_nc_gid=8XXB00fpTHe-ZMnFghur6A&oh=00_AfgpJgyeM22JoPjAt-uOPdKItgI8xeInCzjaYyJT3NGrtA&oe=69285512" 
            alt="NEMSU Logo" 
            className="w-20 h-20 object-contain"
          />
      </div>
      <p className="text-[10pt]">Republic of the Philippines</p>
      <h1 className="text-[12pt] font-bold uppercase text-blue-900 tracking-wide">
        North Eastern Mindanao State University
      </h1>
    </div>
  );

  const DocumentFooter = () => (
    <div className="border-t border-blue-900/50 pt-2 mt-8 w-full select-none" contentEditable={false}>
      <div className="flex items-end justify-between text-[9pt] font-sans text-gray-600">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <span>📍</span>
                <span>NEMSU Main Campus, Tandag City</span>
            </div>
            <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+63 999 663 4946</span>
            </div>
            <div className="flex items-center gap-2">
                <span>🌐</span>
                <span className="text-blue-800 underline">www.nemsu.edu.ph</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="h-10 w-10 border border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                <span className="text-[6px] font-bold">ISO</span>
                <span className="text-[6px]">9001</span>
            </div>
            <div className="h-10 w-10 border border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                <span className="text-[6px] font-bold">UKAS</span>
                <span className="text-[6px]">✔</span>
            </div>
          </div>
      </div>
      <div className="text-center text-[8pt] text-gray-400 mt-2">
          System Generated by NEMSU AI DocuFlow
      </div>
    </div>
  );

  const containerClasses = isMaximized 
    ? "fixed inset-0 z-50 flex flex-col bg-gray-200 dark:bg-gray-900 h-screen w-screen animate-in fade-in duration-300" 
    : "flex flex-col h-full bg-gray-100 dark:bg-gray-900 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 shadow-inner relative transition-all duration-300";

  return (
    <div className={containerClasses}>
      {/* Styles for content mimicking Word tables */}
      <style>{`
        .document-editor table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1em;
        }
        .document-editor th, .document-editor td {
          border: 1px solid black;
          padding: 4px 8px;
          vertical-align: top;
        }
        .document-editor .no-border td {
          border: none;
        }
      `}</style>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-2 flex items-center gap-1 flex-wrap shadow-sm z-10 shrink-0">
        <ToolbarButton icon={Undo} cmd="undo" title="Undo" />
        <ToolbarButton icon={Redo} cmd="redo" title="Redo" />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <ToolbarButton icon={Bold} cmd="bold" title="Bold" />
        <ToolbarButton icon={Italic} cmd="italic" title="Italic" />
        <ToolbarButton icon={Underline} cmd="underline" title="Underline" />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} cmd="justifyRight" title="Align Right" />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <ToolbarButton icon={List} cmd="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" title="Numbered List" />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <button
           onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'H2'); }}
           className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition font-bold"
           title="Heading"
        >
          H1
        </button>
        <div className="flex-1" />
        <button onClick={handleCopy} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition flex items-center gap-2 text-sm font-medium">
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
         <button onClick={handlePrint} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-2 text-sm font-medium">
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        <button 
          onClick={() => setIsMaximized(!isMaximized)} 
          className={`p-2 rounded transition flex items-center gap-2 text-sm font-medium ${isMaximized ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title={isMaximized ? "Exit Focus Mode" : "Focus Mode"}
        >
          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-gray-200 dark:bg-gray-900/50" onClick={checkHeight} onKeyUp={checkHeight}>
        
        {/* Paper Container */}
        <div 
          id="document-paper-wrapper"
          className="
            w-[210mm] text-black shadow-2xl 
            min-h-[297mm]
            p-[10mm]
            relative
          "
          style={{ 
            fontFamily: '"Times New Roman", Times, serif',
            /* 
               Creates a visual page break effect:
               - 297mm White (A4)
               - 10mm Gray (Gap)
               - Repeats
            */
            backgroundImage: `repeating-linear-gradient(
                to bottom,
                #ffffff 0mm,
                #ffffff 290mm, 
                #d1d5db 290mm, 
                #d1d5db 297mm
            )`,
            backgroundSize: '100% 297mm', // Force exact A4 repetition
            marginBottom: '50px' // Allow scrolling past end
          }}
        >
          <table className="w-full h-full border-collapse">
            <thead className="h-auto">
              <tr>
                <td className="border-0 p-0">
                  <DocumentHeader />
                </td>
              </tr>
            </thead>
            <tfoot className="h-auto">
              <tr>
                <td className="align-bottom border-0 p-0">
                   <div className="h-[5mm]" />
                   <DocumentFooter />
                </td>
              </tr>
            </tfoot>
            <tbody className="w-full">
              <tr>
                <td className="align-top h-full border-0 p-0">
                  <div 
                    ref={editorRef}
                    contentEditable
                    onInput={checkHeight}
                    className="
                      outline-none 
                      document-editor
                      min-h-[180mm]
                    "
                    style={{
                      fontSize: '12pt',
                      lineHeight: '1.5'
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-1 text-xs text-gray-500 flex justify-between shrink-0">
        <span>Page {pageCount} • A4 Layout • Gray bars indicate page breaks</span>
        <span>
            {isMaximized && (
                <button onClick={() => setIsMaximized(false)} className="text-emerald-600 font-bold hover:underline ml-2">
                    Exit Focus Mode (Esc)
                </button>
            )}
        </span>
      </div>
      
      {isMaximized && (
        <button 
            onClick={() => setIsMaximized(false)}
            className="fixed top-4 right-4 z-[60] bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
            <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
