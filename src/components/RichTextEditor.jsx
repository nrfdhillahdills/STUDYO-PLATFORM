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

  function execCmd(command, value = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  }

  function insertImage() {
    const url = prompt("Masukkan URL gambar materi (https://...):");
    if (url && url.trim() !== "") {
      execCmd("insertImage", url.trim());
    }
  }

  function insertTable() {
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Kosakata / Istilah</th>
            <th>Pelafalan</th>
            <th>Arti</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contoh 1</td>
            <td>Pelafalan 1</td>
            <td>Arti 1</td>
          </tr>
          <tr>
            <td>Contoh 2</td>
            <td>Pelafalan 2</td>
            <td>Arti 2</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    execCmd("insertHTML", tableHtml);
  }

  return (
    <div className="border-2 border-[#E6E0D2] rounded-2xl overflow-hidden bg-[#FAF8F2]">
      {/* Toolbar Rich Text Editor */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-[#182338] text-white">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          title="Bold"
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-extrabold transition cursor-pointer"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          title="Italic"
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs italic font-bold transition cursor-pointer"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="Underline"
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs underline font-bold transition cursor-pointer"
        >
          U
        </button>

        <span className="w-px h-5 bg-[#384E7A] mx-1" />

        <button
          type="button"
          onClick={() => execCmd("formatBlock", "H1")}
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-extrabold transition cursor-pointer"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "H2")}
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-extrabold transition cursor-pointer"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "P")}
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-bold transition cursor-pointer"
        >
          Paragraf
        </button>

        <span className="w-px h-5 bg-[#384E7A] mx-1" />

        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-bold transition cursor-pointer"
        >
          • Bullet List
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          className="px-2.5 py-1 rounded-lg bg-[#253554] hover:bg-[#FBE48B] hover:text-[#182338] text-xs font-bold transition cursor-pointer"
        >
          1. Number List
        </button>

        <span className="w-px h-5 bg-[#384E7A] mx-1" />

        <button
          type="button"
          onClick={insertTable}
          className="px-2.5 py-1 rounded-lg bg-[#FBE48B] text-[#182338] hover:brightness-105 text-xs font-extrabold transition cursor-pointer"
        >
          + Tabel Kosakata
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="px-2.5 py-1 rounded-lg bg-[#FBE48B] text-[#182338] hover:brightness-105 text-xs font-extrabold transition cursor-pointer"
        >
          + Gambar
        </button>
      </div>

      {/* Area Ketik ContentEditable */}
      <div
        ref={editorRef}
        contentEditable
        onInput={syncContent}
        onBlur={syncContent}
        className="rich-content min-h-[200px] p-4 bg-white text-sm text-[#182338] focus:outline-none"
      />

      {/* Hidden Input agar terkirim otomatis bersama Server Action Form */}
      <input type="hidden" name={name} value={htmlValue} />
    </div>
  );
}