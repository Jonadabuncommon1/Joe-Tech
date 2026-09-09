import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Search, Folder, Loader2 } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { uploadImage } from '../../lib/supabase';

export const MediaManager = () => {
  const { products } = useAppContext();
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Categories are icon+gradient, not photos (`Category` has no `.image`
  // field), so that used to spread in `undefined` for every one of them,
  // an `<img src={undefined}>` per category, rendering as a broken/missing
  // thumbnail no matter what was actually uploaded. Dropped that source
  // entirely, and `.filter(Boolean)` as a general safety net so a product
  // with a missing/empty image slot can't do the same thing.
  const allImages = [
    ...uploadedMedia,
    ...products.flatMap(p => p.images)
  ].filter(Boolean).slice(0, 24);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setUploadedMedia(prev => [url, ...prev]);
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage infinite uploads synced to your Supabase Cloud Storage.</p>
        </div>
        <label className="flex items-center space-x-2 bg-[#3626a7] hover:bg-[#281c7d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border dark:border-white/10 shadow-sm transition-colors duration-500">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-800 dark:text-white" />
            <input 
              type="text" 
              placeholder="Search images..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-800 dark:text-white text-sm focus:outline-none focus:border-[#3626a7] rounded-lg transition-colors"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-white/5">
            <Folder size={16} />
            <span>Folders</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allImages.map((img, i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-lg border dark:border-white/10 overflow-hidden relative group transition-colors">
              <img src={img} alt={`Media ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button className="bg-white/20 p-2 rounded-full text-gray-800 dark:text-white hover:bg-[#3626a7] hover:text-white"><ImageIcon size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
