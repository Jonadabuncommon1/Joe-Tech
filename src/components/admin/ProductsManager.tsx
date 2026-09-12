import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Flame, Zap, Ban, CheckCircle2, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../store/AppContext';
import { formatPrice } from '../../data';
import { ProductUploadForm, FormState, emptyForm, VariantFormRow } from './ProductUploadForm';
import { getDisplayPrice, hasVariants } from '../../data';

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  condition?: string;
  isHot?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  badge?: string;
  colors?: string[];
  inStock?: boolean;
  location?: string;
  created_at?: string;
  createdAt?: string;
  [key: string]: any;
}

export const ProductsManager = () => {
  const { products, updateProduct, deleteProduct } = useAppContext();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentForm, setCurrentForm] = useState<FormState>(emptyForm());
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const formatWATDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleString('en-US', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const productList = (products || []) as AdminProduct[];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productList.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      const inStock = p.inStock !== false;
      const matchesStock =
        stockFilter === 'all' || (stockFilter === 'in' ? inStock : !inStock);
      return matchesSearch && matchesStock;
    });
  }, [productList, search, stockFilter]);

  const stockCounts = useMemo(
    () => ({
      all: productList.length,
      in: productList.filter((p) => p.inStock !== false).length,
      out: productList.filter((p) => p.inStock === false).length,
    }),
    [productList],
  );

  const toggleStock = async (product: AdminProduct) => {
    const nextInStock = product.inStock === false;
    try {
      await updateProduct(product.id, { inStock: nextInStock });
      toast.success(
        nextInStock ? `${product.name} marked back in stock` : `${product.name} marked out of stock`,
      );
    } catch {
      toast.error(`Could not save that change for ${product.name}. Check your connection and try again.`);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setCurrentForm(emptyForm());
    setIsModalOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setCurrentForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      description: product.description || '',
      images: product.images || [],
      condition: product.condition || 'UK Used',
      isHot: !!product.isHot,
      isTrending: !!product.isTrending,
      isNew: !!product.isNew,
      badge: product.badge || '',
      colors: product.colors || [],
      inStock: product.inStock !== false,
      location: product.location || '',
      variants: (product.variants || []).map(
        (v): VariantFormRow => ({
          label: v.label,
          price: String(v.price),
          originalPrice: v.originalPrice ? String(v.originalPrice) : '',
          inStock: v.inStock !== false,
        }),
      ),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSuccess = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
    closeModal();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Remove "${name}" from the marketplace?`)) {
      try {
        await deleteProduct(id);
        toast.success(`${name} removed.`);
      } catch {
        toast.error(`Could not remove ${name}. Check your connection and try again.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/40 dark:text-green-300 px-4 py-3 rounded-lg text-sm font-medium">
          Product saved successfully. Storefront, Hot Deals, and Trending grids updated.
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Products Management</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Add, edit, or categorize listings. Changes apply across all sections immediately.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center space-x-2 bg-[#3626a7] hover:bg-[#281c7d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] p-4 text-gray-900 dark:text-gray-100 rounded-2xl border dark:border-white/10 shadow-sm space-y-4 transition-colors duration-500">
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'all' as const, label: 'All', count: stockCounts.all },
            { key: 'in' as const, label: 'In Stock', count: stockCounts.in },
            { key: 'out' as const, label: 'Out of Stock', count: stockCounts.out },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStockFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                stockFilter === tab.key
                  ? 'bg-[#3626a7] text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search products by title, category, specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#3626a7] rounded-lg transition-colors"
          />
        </div>

        {/* Phone layout: the seven-column table below needs ~900px, so on a
            phone it was a sideways scroll with most columns off screen. Same
            data, stacked into a card per product. */}
        <div className="space-y-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-600 dark:text-gray-300">
              No products match your search.
            </p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 dark:border-white/10 p-3"
              >
                <div className="flex gap-3">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover shadow-sm"
                    />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gray-200 text-xs text-gray-500 dark:bg-gray-800">
                      N/A
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-[#3626a7] dark:text-[#6b58ea]">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {product.category}
                      {product.condition ? ` · ${product.condition}` : ''}
                    </p>
                    {product.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={11} /> {product.location}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                      {hasVariants(product) && <span className="mr-1 text-[10px] font-semibold uppercase text-gray-400">From</span>}
                      {formatPrice(getDisplayPrice(product))}
                    </p>
                  </div>
                </div>

                {(product.isHot || product.isTrending || product.badge) && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {product.isHot && (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <Flame size={10} /> HOT
                      </span>
                    )}
                    {product.isTrending && (
                      <span className="inline-flex items-center gap-1 rounded border border-purple-300 bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-900 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        <Zap size={10} /> TRENDING
                      </span>
                    )}
                    {product.badge && (
                      <span className="rounded border bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {product.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* The desktop table has an "Uploaded" column for this; the
                    phone cards had nowhere showing when a listing went up,
                    which is the layout Joe actually runs the shop from. */}
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <Clock size={11} className="shrink-0" />
                  Uploaded {formatWATDate(product.created_at || product.createdAt)}
                </p>

                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => toggleStock(product)}
                    className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                      product.inStock === false
                        ? 'border-red-200 bg-red-100 text-red-800 dark:border-red-800/30 dark:bg-red-900/30 dark:text-red-400'
                        : 'border-green-200 bg-green-100 text-green-800 dark:border-green-800/30 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {product.inStock === false ? <Ban size={11} /> : <CheckCircle2 size={11} />}
                    {product.inStock === false ? 'Out of Stock' : 'In Stock'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      <Edit size={15} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="inline-flex items-center rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-500/10"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="text-xs text-gray-900 dark:text-gray-100 uppercase bg-gray-50 dark:bg-white/5 border-b dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Placements & Badges</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-600 dark:text-gray-300">
                    No products match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded shadow-sm object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded shadow-sm bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                          N/A
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-[#3626a7] dark:text-[#6b58ea] line-clamp-1 max-w-[200px]">
                          {product.name}
                        </span>
                        {product.condition && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {product.condition}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{product.category}</div>
                      {product.location && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <MapPin size={11} /> {product.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      {hasVariants(product) && <span className="mr-1 text-[10px] font-semibold uppercase text-gray-400">From</span>}
                      {formatPrice(getDisplayPrice(product))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap max-w-[180px]">
                        {product.isHot && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-700">
                            <Flame size={10} /> HOT
                          </span>
                        )}
                        {product.isTrending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-300 rounded border border-purple-300 dark:border-purple-700">
                            <Zap size={10} /> TRENDING
                          </span>
                        )}
                        {product.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border dark:border-gray-700">
                            {product.badge}
                          </span>
                        )}
                        {!product.isHot && !product.isTrending && !product.badge && (
                          <span className="text-gray-400 text-xs">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {formatWATDate(product.created_at || product.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStock(product)}
                        title="Click to toggle availability"
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded border transition-colors ${
                          product.inStock === false
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/30 hover:bg-red-200 dark:hover:bg-red-900/50'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/30 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {product.inStock === false ? <Ban size={11} /> : <CheckCircle2 size={11} />}
                        {product.inStock === false ? 'Out of Stock' : 'In Stock'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="text-gray-400 dark:text-gray-500 hover:text-[#3626a7] dark:hover:text-white inline-flex p-1"
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 inline-flex p-1"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductUploadForm
          editingId={editingId}
          initialForm={currentForm}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};