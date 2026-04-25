'use client';
import { useState, useRef } from 'react';

export default function RecognizePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File) => {
    // Hiển thị preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Convert sang base64 và gọi API
    setLoading(true);
    const base64Reader = new FileReader();
    base64Reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      try {
        const res = await fetch('/api/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        setIngredients(data.ingredients || []);
      } catch {
        alert('Lỗi nhận dạng, kiểm tra lại API key!');
      } finally {
        setLoading(false);
      }
    };
    base64Reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">
        🍳 AI Food Recognition
      </h1>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-teal-500 rounded-xl p-10 text-center cursor-pointer hover:bg-teal-900/20 transition"
        onClick={() => fileRef.current?.click()}
      >
        <p className="text-gray-300">Click để chọn ảnh nguyên liệu</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
        />
      </div>

      {/* Preview */}
      {preview && (
        <img src={preview} alt="preview" className="mt-6 rounded-xl max-h-64 object-contain" />
      )}

      {/* Loading */}
      {loading && (
        <p className="mt-4 text-teal-400 animate-pulse">⏳ Đang nhận dạng nguyên liệu...</p>
      )}

      {/* Kết quả */}
      {ingredients.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white mb-3">Nguyên liệu phát hiện:</h2>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, i) => (
              <span key={i} className="bg-teal-700 text-white px-3 py-1 rounded-full text-sm">
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}