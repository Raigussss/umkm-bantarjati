import { useRef, useState } from "react";

interface ImageCropperProps {
  label: string;
  accept?: string;
  onCropped: (file: File | null) => void;
}

export default function ImageCropper({
  label,
  accept = "image/jpeg,image/png",
  onCropped,
}: ImageCropperProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onCropped(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    onCropped(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-gray-700">{label}</label>
        {selectedFile && <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">Siap dipakai</span>}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100"
        >
          {selectedFile ? "Ganti foto" : "Pilih foto"}
        </button>
        {(selectedFile || previewUrl) && (
          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-100"
          >
            Hapus
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => handleFileSelect(event.target.files?.[0])}
        className="hidden"
      />

      {previewUrl && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
            <span>Preview</span>
            <span>{selectedFile?.name || "foto"}</span>
          </div>
          <img src={previewUrl} alt="Preview foto UMKM" className="h-36 w-full rounded-xl object-cover shadow-sm" />
          <p className="mt-2 text-[11px] text-gray-500">Foto akan dipakai langsung tanpa crop, lalu bisa dibuka full-size di halaman Home saat diklik.</p>
        </div>
      )}
    </div>
  );
}
