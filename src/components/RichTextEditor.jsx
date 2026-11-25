"use client";

import { useRef, useState, useEffect } from "react";

export default function RichTextEditor({ name = "body", defaultValue = "" }) {
  const editorRef = useRef(null);
  const [htmlValue, setHtmlValue] = useState(defaultValue);

  useEffect(() => {
    if (editorRef.current && defaultValue && editorRef.current.innerHTML !== defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  function syncContent() {
    if (editorRef.current) {
      setHtmlValue(editorRef.current.innerHTML);
    }
  }

  function execCmd(command) {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    syncContent();
  }

  return (
    <div className="border-2 border-[#E6E0D2] rounded-2xl overflow-hidden bg-[#FAF8F2]">
      {/* Toolbar Ringkas: Bold, Italic, Underline */}
      <div className="flex items-center gap-2 p-2.5 bg-[#182338] text-white">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          title="Bold"
          className="px-3 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-extrabold transition cursor-pointer"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          title="Italic"
          className="px-3 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs italic font-bold transition cursor-pointer"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="Underline"
          className="px-3 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs underline font-bold transition cursor-pointer"
        >
          U
        </button>
      </div>

      {/* Area Ketik */}
      <div
        ref={editorRef}
        contentEditable
        onInput={syncContent}
        onBlur={syncContent}
        className="rich-content min-h-[180px] p-4 bg-white text-sm text-[#182338] focus:outline-none"
      />

      <input type="hidden" name={name} value={htmlValue} />
    </div>
  );
}