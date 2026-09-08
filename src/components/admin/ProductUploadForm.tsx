import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2, Flame, Zap, Tag, Ban, CheckCircle2, Link2, Clipboard, MapPin } from 'lucide-react';
import { marketplaceCategories } from '../../data';
import { uploadImage } from '../../lib/supabase';
import { useAppContext } from '../../store/AppContext';

export type FormState = {
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  description: string;
  images: string[];
  condition: string;
  isHot: boolean;
  isTrending: boolean;
  isNew: boolean;
  badge: string;
  colors: string[];
  inStock: boolean;
  /** Which branch has this item: 'Nsukka' or 'Lagos', or '' for older rows
   *  uploaded before this field existed. */
  location: string;
};

export const PRODUCT_LOCATIONS = ['Nsukka', 'Lagos'] as const;

export const AVAILABLE_COLORS = [
  'Space Grey',
  'Silver',
  'Gold',
  'Midnight',
  'Starlight',
  'Deep Purple',
  'Titanium Black',
  'Natural Titanium',
  'Blue',
  'Red',
  'Green',
  'White',
  'Black',
];

export const emptyForm = (): FormState => ({
  name: '',
  category: marketplaceCategories.find((c) => !c.isService)?.name || 'iPhones & iPads',
  price: '',
  originalPrice: '',
  description: '',
  images: [],
  condition: 'UK Used',
  isHot: false,
  isTrending: false,
  isNew: false,
  badge: '',
  colors: [],
  inStock: true,
  location: '',
});

interface ProductUploadFormProps {
  editingId: string | null;
  initialForm: FormState;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductUploadForm: React.FC<ProductUploadFormProps> = ({
  editingId,
  initialForm,
  onClose,
  onSuccess,
}) => {
  const { addProduct, updateProduct } = useAppContext();
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const totalImageCount = form.images.length + selectedFiles.length;

  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (totalImageCount + files.length > 5) {
      setFormError('Maximum 5 images allowed per product.');
      return;
    }
    setFormError('');
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/\S+\.\S+/i.test(url)) {
      setFormError('Enter a full image link starting with http:// or https://');
      return;
    }
    if (totalImageCount + 1 > 5) {
      setFormError('Maximum 5 images allowed per product.');
      return;
    }
    setFormError('');
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageUrlInput('');
  };

  // Paste an image (Ctrl+V) anywhere in the form, e.g. copied from a web page
  // or a screenshot, straight into the picker, no need to save it to disk first.
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length === 0) return; // no image on the clipboard, leave normal text paste alone
      e.preventDefault();
      addFiles(pastedFiles);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalImageCount]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined;

    if (!form.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Enter a valid price in Naira.');
      return;
    }
    if (form.images.length === 0 && selectedFiles.length === 0) {
      setFormError('At least one image is required.');
      return;
    }

    setIsUploading(true);
    setFormError('');

    try {
      const uploadedUrls: string[] = [...form.images];

      for (const file of selectedFiles) {
        try {
          const url = await uploadImage(file);
          if (url) {
            uploadedUrls.push(url);
          }
        } catch (err: any) {
          throw new Error(`Upload failed: ${err.message || 'Unknown error'}`);
        }
      }

      // `null`, not `undefined`, for anything the admin can clear. Supabase
      // sends this object as JSON, and JSON.stringify drops `undefined` keys
      // entirely, so an update payload built with `undefined` never actually
      // told the database to clear the column, it just silently left the old
      // value in place forever. Confirmed live: removing a product's discount
      // badge appeared to work until the next reload, then it came right
      // back, because the "removal" was never actually saved.
      const payload: any = {
        name: form.name.trim(),
        category: form.category,
        price,
        originalPrice: originalPrice ?? null,
        description: form.description.trim() || 'Premium listing from Joe Tech.',
        images: uploadedUrls,
        condition: form.condition,
        isHot: form.isHot,
        isTrending: form.isTrending,
        isNew: form.isNew,
        badge: form.badge.trim() || null,
        colors: form.colors.length > 0 ? form.colors : null,
        inStock: form.inStock,
        location: form.location || null,
      };

      if (editingId) {
        await (updateProduct as any)(editingId, payload);
      } else {
        await (addProduct as any)(payload);
      }

      onSuccess();
    } catch (error: any) {
      setFormError(error.message || 'Failed to publish product. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Drawer */}
      <form
        onSubmit={handlePublish}
        className="relative w-full md:w-[640px] h-full bg-white dark:bg-[#0a0a0a] shadow-2xl flex flex-col transform transition-transform duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingId ? 'Edit Product Listing' : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure inventory pricing, home showcase placements, and specs
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg px-4 py-3 flex items-center">
              <span className="mr-2">⚠️</span> {formError}
            </p>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Product Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 15 Pro Max 256GB"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] focus:ring-2 focus:ring-[#3626a7]/20 transition-all shadow-sm text-sm"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] text-sm shadow-sm"
                >
                  {marketplaceCategories
                    .filter((c) => !c.isService)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Condition
                </label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] text-sm shadow-sm"
                >
                  <option value="UK Used">Clean UK Used</option>
                  <option value="Brand New">Brand New Sealed</option>
                  <option value="Refurbished">Certified Refurbished</option>
                </select>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Availability
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, inStock: true })}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    form.inStock
                      ? 'border-green-500 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-green-300 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-gray-400'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  In Stock
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, inStock: false })}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    !form.inStock
                      ? 'border-red-500 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-red-300 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-gray-400'
                  }`}
                >
                  <Ban size={16} />
                  Out of Stock
                </button>
              </div>
              {!form.inStock && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Shoppers will see an Out of Stock badge and cannot add this to cart until you switch it back.
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PRODUCT_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setForm({ ...form, location: loc })}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                      form.location === loc
                        ? 'border-[#3626a7] bg-[#3626a7]/10 text-[#3626a7] dark:border-[#6b58ea] dark:bg-[#6b58ea]/10 dark:text-[#6b58ea]'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-[#3626a7]/40 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-gray-400'
                    }`}
                  >
                    <MapPin size={16} />
                    {loc}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Which branch this item is at. Shown on the product page so buyers know where it is.
              </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Selling Price (₦)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 850000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] text-sm shadow-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Original Price (₦ Strikethrough)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 950000"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Placements & Showcase Controls */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Storefront Placements
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-[#15171e] border border-gray-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer p-2 rounded-lg hover:bg-amber-500/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isHot}
                    onChange={(e) => setForm({ ...form, isHot: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <Flame size={14} /> Hot Deals
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isTrending}
                    onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400">
                    <Zap size={14} /> Trending
                  </span>
                </label>
              </div>
            </div>

            {/* Custom Tag / Badge */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Custom Promo Badge
              </label>
              <div className="relative">
                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. -25% OFF, TOP SELLER"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Colors
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] transition-all shadow-sm text-left flex justify-between items-center text-sm"
                >
                  <span className="truncate">
                    {form.colors.length > 0 ? form.colors.join(', ') : 'Select colors in stock...'}
                  </span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>
                {isColorDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 custom-scrollbar">
                    {AVAILABLE_COLORS.map((c) => (
                      <label
                        key={c}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#222] rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={form.colors.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, colors: [...form.colors, c] });
                            } else {
                              setForm({
                                ...form,
                                colors: form.colors.filter((col) => col !== c),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#3626a7] focus:ring-[#3626a7]"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {c}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Description & Specs
              </label>
              <textarea
                rows={3}
                placeholder="Include storage, battery health, warranty..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#3626a7] transition-all shadow-sm resize-none text-sm"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Product Images (Max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-[#1a1a1a] text-center transition-colors hover:bg-gray-100 dark:hover:bg-[#222]">
                <UploadCloud size={32} className="text-[#3626a7] mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  Select device images, paste one (Ctrl+V), or add a web link below
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 flex items-center justify-center gap-1">
                  <Clipboard size={11} /> Copy an image anywhere and press Ctrl+V (or Cmd+V) on this page to add it
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    addFiles(Array.from(e.target.files || []));
                    e.target.value = '';
                  }}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3626a7] file:text-white hover:file:bg-[#281c7d] cursor-pointer"
                />

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      placeholder="Or paste an image link (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImageUrl();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg text-xs focus:outline-none focus:border-[#3626a7]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="shrink-0 px-3.5 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {form.images.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative aspect-square rounded-lg overflow-hidden border border-[#3626a7] group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 sm:space-x-0 bg-gray-50 dark:bg-[#0f0f0f] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#222]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-[#3626a7] hover:bg-[#281c7d] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#3626a7]/20 transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <span>{editingId ? 'Save Changes' : 'Publish Product'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};