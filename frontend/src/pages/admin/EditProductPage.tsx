import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { slugify } from '../../utils/slugify';
import type { ProductCategory, SoftwareCompatibility } from '../../types/product';

export const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getProductById, updateProduct } = useProducts();
  const { categories } = useCategories();

  const existingProduct = id ? getProductById(id) : undefined;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Softwares');
  const [software, setSoftware] = useState<SoftwareCompatibility>('AutoCAD');
  const [price, setPrice] = useState<number | ''>(499);
  const [oldPrice, setOldPrice] = useState<number | ''>(999);
  const [format, setFormat] = useState('ZIP');
  const [fileSize, setFileSize] = useState('100 MB');
  const [badge, setBadge] = useState<'Bestseller' | 'New' | 'Popular' | 'Hot'>('New');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescriptionText, setFullDescriptionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug);
      setCategory(existingProduct.category);
      setSoftware(existingProduct.software);
      setPrice(existingProduct.price);
      setOldPrice(existingProduct.oldPrice);
      setFormat(existingProduct.format);
      setFileSize(existingProduct.fileSize);
      setBadge(existingProduct.badge || 'New');
      setIsBestSeller(existingProduct.isBestSeller ?? false);
      setIsNewArrival(existingProduct.isNewArrival ?? false);
      setShortDescription(existingProduct.shortDescription || '');
      setFullDescriptionText(existingProduct.description ? existingProduct.description.join('\n') : '');
      setImageUrl(existingProduct.images[0] || '');
    }
  }, [existingProduct]);

  if (!existingProduct) {
    return (
      <AdminLayout title="Edit Product">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">The product you are trying to edit does not exist in LocalStorage.</p>
          <Link to="/admin/products" className="inline-block bg-[#F5A000] text-white font-bold text-xs px-4 py-2 rounded-xl">
            Return to Products
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    const categoryObj = categories.find((c) => c.name.toLowerCase() === category.toLowerCase()) || categories[0];
    const categorySlug = categoryObj ? categoryObj.slug : 'softwares';

    const finalImage = imageUrl.trim() || existingProduct.images[0];

    const descriptionLines = fullDescriptionText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    setIsSubmitting(true);

    const result = updateProduct(existingProduct.id, {
      name: name.trim(),
      slug: slug || slugify(name),
      categorySlug,
      category,
      software,
      price: Number(price),
      oldPrice: Number(oldPrice) || Number(price),
      format,
      fileSize,
      badge,
      isBestSeller,
      isNewArrival,
      shortDescription: shortDescription.trim() || name.trim(),
      description: descriptionLines.length > 0 ? descriptionLines : [shortDescription || name],
      images: [finalImage],
    });

    if (!result.success) {
      setError(result.error || 'Failed to update product.');
      setIsSubmitting(false);
      return;
    }

    navigate('/admin/products');
  };

  return (
    <AdminLayout title={`Edit Product: ${existingProduct.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Product Details</h2>
            <p className="text-xs text-slate-500">Updating product ID: {existingProduct.id}</p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all"
          >
            ← Back to Products
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-2">
              Basic Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Product URL Slug *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 text-[11px] font-mono rounded-l-xl">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
                >
                  <option value="Softwares">Softwares</option>
                  <option value="Excel Sheets">Excel Sheets</option>
                  <option value="eBooks">eBooks</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-[#F5A000] text-slate-700">Software Software *</label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value as SoftwareCompatibility)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
                >
                  <option value="AutoCAD">AutoCAD</option>
                  <option value="Revit">Revit</option>
                  <option value="SketchUp">SketchUp</option>
                  <option value="3ds Max">3ds Max</option>
                  <option value="Lumion">Lumion</option>
                  <option value="Tekla">Tekla Structures</option>
                  <option value="MS Office">MS Office</option>
                  <option value="MS Project">MS Project</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Badge / Label</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Popular">Popular</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
            </div>

            {/* Product Visibility / Highlights Checkboxes */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Product Highlights / Visibility
              </label>
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000] cursor-pointer"
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000] cursor-pointer"
                  />
                  <span>New Arrival</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Checking these boxes immediately updates LocalStorage and synchronizes the Home Page sections.
              </p>
            </div>
          </div>

          {/* Pricing & Technical Files */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-2">
              Pricing & Technical Specs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">File Format</label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">File Size</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>
            </div>
          </div>

          {/* Descriptions & Image */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-2">
              Descriptions & Graphic
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Short Summary Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Description Paragraphs (1 per line)</label>
              <textarea
                rows={4}
                value={fullDescriptionText}
                onChange={(e) => setFullDescriptionText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  />
                </div>

                <div className="text-center text-[11px] font-bold text-slate-400 uppercase">OR Upload New Image File</div>

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-[#F5A000] hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Image Preview</label>
                <div className="h-40 w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img src={imageUrl || existingProduct.images[0]} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <Link
              to="/admin/products"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Product Changes'}
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};

export default EditProductPage;
