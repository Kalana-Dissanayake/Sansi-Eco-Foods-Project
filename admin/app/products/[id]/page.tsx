'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import { getProductById, createProduct, updateProduct, getAllCategories } from '../../../lib/firestore';
import type { Product, Category } from '../../../../shared/types';

interface ProductFormData {
  name: string;
  slug: string;
  skuCode: string;
  categoryId: string;
  description: string;
  ingredients: string;
  weightGrams: number;
  priceLKR: number;
  compareAtPriceLKR: number;
  shelfLife: string;
  packetDimensions: string;
  stockQuantity: number;
  lowStockThreshold: number;
  healthTags: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  slug: '',
  skuCode: '',
  categoryId: '',
  description: '',
  ingredients: '',
  weightGrams: 60,
  priceLKR: 0,
  compareAtPriceLKR: 0,
  shelfLife: '6 months',
  packetDimensions: '',
  stockQuantity: 0,
  lowStockThreshold: 10,
  healthTags: 'No Preservatives, 100% Natural, No Chemicals',
  isActive: true,
  sortOrder: 100,
};

export default function ProductFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';

  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const cats = await getAllCategories();
      setCategories(cats);
      if (!isNew && params.id) {
        const product = await getProductById(params.id);
        if (product) {
          setForm({
            name: product.name,
            slug: product.slug,
            skuCode: product.skuCode,
            categoryId: product.categoryId,
            description: product.description,
            ingredients: product.ingredients,
            weightGrams: product.weightGrams,
            priceLKR: product.priceLKR,
            compareAtPriceLKR: product.compareAtPriceLKR,
            shelfLife: product.shelfLife,
            packetDimensions: product.packetDimensions ?? '',
            stockQuantity: product.stockQuantity,
            lowStockThreshold: product.lowStockThreshold,
            healthTags: (product.healthTags ?? []).join(', '),
            isActive: product.isActive,
            sortOrder: product.sortOrder,
          });
          setExistingImages(product.images ?? []);
        }
      }
      setLoading(false);
    };
    load();
  }, [isNew, params.id]);

  const updateForm = (field: keyof ProductFormData, value: string | number | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = (value as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return updated;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4 - existingImages.length);
      setNewImageFiles((prev) => [...prev, ...files].slice(0, 4));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local');
    }

    for (const file of newImageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary.');
      }

      const data = await res.json();
      urls.push(data.secure_url);
    }
    return urls;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.skuCode.trim() || form.priceLKR <= 0) {
      toast.error('Please fill in Name, SKU Code, and Price.');
      return;
    }
    setSaving(true);
    try {
      const newUrls = await uploadImages();
      const allImages = [...existingImages, ...newUrls];

      const data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        skuCode: form.skuCode.trim(),
        categoryId: form.categoryId,
        description: form.description.trim(),
        ingredients: form.ingredients.trim(),
        weightGrams: Number(form.weightGrams),
        priceLKR: Number(form.priceLKR),
        compareAtPriceLKR: Number(form.compareAtPriceLKR) || Number(form.priceLKR),
        shelfLife: form.shelfLife.trim(),
        packetDimensions: form.packetDimensions.trim(),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        healthTags: form.healthTags.split(',').map((t) => t.trim()).filter(Boolean),
        isActive: form.isActive,
        inStock: Number(form.stockQuantity) > 0,
        sortOrder: Number(form.sortOrder),
        images: allImages,
      };

      if (isNew) {
        await createProduct(data);
        toast.success('Product created successfully!');
      } else {
        await updateProduct(params.id, data);
        toast.success('Product updated successfully!');
      }
      router.push('/products');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isNew ? 'New Product' : 'Edit Product'}>
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${props.className ?? ''}`}
    />
  );

  const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
    />
  );

  return (
    <AdminLayout title={isNew ? 'Add New Product' : 'Edit Product'}>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'Add New Product' : 'Edit Product'}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/products')}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
              ) : `${isNew ? 'Create' : 'Update'} Product`}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Basic Information</h3>
              <div>
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="e.g., Dehydrated Mango Jujubes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>URL Slug</Label>
                  <Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="auto-generated" />
                </div>
                <div>
                  <Label>SKU Code *</Label>
                  <Input value={form.skuCode} onChange={(e) => updateForm('skuCode', e.target.value)} placeholder="SEF-001" />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateForm('categoryId', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <TextArea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={4} placeholder="Product description..." />
              </div>
              <div>
                <Label>Ingredients</Label>
                <Input value={form.ingredients} onChange={(e) => updateForm('ingredients', e.target.value)} placeholder="e.g., Mango, Sugar" />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Pricing & Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (LKR) *</Label>
                  <Input type="number" value={form.priceLKR} onChange={(e) => updateForm('priceLKR', parseFloat(e.target.value))} min={0} />
                </div>
                <div>
                  <Label>Compare-At Price (LKR)</Label>
                  <Input type="number" value={form.compareAtPriceLKR} onChange={(e) => updateForm('compareAtPriceLKR', parseFloat(e.target.value))} min={0} />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input type="number" value={form.stockQuantity} onChange={(e) => updateForm('stockQuantity', parseInt(e.target.value))} min={0} />
                </div>
                <div>
                  <Label>Low Stock Threshold</Label>
                  <Input type="number" value={form.lowStockThreshold} onChange={(e) => updateForm('lowStockThreshold', parseInt(e.target.value))} min={1} />
                </div>
              </div>
            </div>

            {/* Physical Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Physical Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight (grams)</Label>
                  <Input type="number" value={form.weightGrams} onChange={(e) => updateForm('weightGrams', parseInt(e.target.value))} min={1} />
                </div>
                <div>
                  <Label>Shelf Life</Label>
                  <Input value={form.shelfLife} onChange={(e) => updateForm('shelfLife', e.target.value)} placeholder="e.g., 6 months" />
                </div>
                <div>
                  <Label>Packet Dimensions</Label>
                  <Input value={form.packetDimensions} onChange={(e) => updateForm('packetDimensions', e.target.value)} placeholder="e.g., 10cm x 12cm" />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => updateForm('sortOrder', parseInt(e.target.value))} min={1} />
                </div>
              </div>
              <div>
                <Label>Health Tags (comma-separated)</Label>
                <Input value={form.healthTags} onChange={(e) => updateForm('healthTags', e.target.value)} placeholder="No Preservatives, 100% Natural" />
              </div>
            </div>
          </div>

          {/* Right: Images & Status */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Status</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateForm('isActive', !form.isActive)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  aria-label="Toggle active status"
                >
                  <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {form.isActive ? 'Active (visible to customers)' : 'Inactive (hidden)'}
                </span>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Product Images</h3>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                      <Image src={url} alt={`Product image ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="120px" />
                      <button
                        onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Image Previews */}
              {newImageFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {newImageFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`New image ${i + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="120px"
                      />
                      <button
                        onClick={() => setNewImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(existingImages.length + newImageFiles.length) < 4 && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-green-300 transition-colors"
                  >
                    <div className="text-3xl mb-1">📷</div>
                    <div className="text-sm text-gray-400 font-medium">Click to upload images</div>
                    <div className="text-xs text-gray-300">PNG, JPG up to 2MB each (max 4)</div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
