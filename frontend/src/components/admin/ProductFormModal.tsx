import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  HelpCircle,
  FileText,
  Sparkles,
  Layers,
  RefreshCw,
  Video,
  Link as LinkIcon,
  DollarSign,
  Gift,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type {
  Product,
  SubscriptionDuration,
  FAQ,
  Feature,
  Requirement
} from '../../types/product';
import { slugify } from '../../utils/slugify';
import { RichTextEditor } from './RichTextEditor';
import { IconPickerModal } from './IconPickerModal';
import { brandApi, type BrandRecord } from '../../services/brandApi';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  /** Full admin page instead of a popup. */
  asPage?: boolean;
  onSubmit: (
    data: Partial<Product> & { name: string; price: number },
    isDraft?: boolean
  ) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  asPage = false,
}) => {
  const isEditing = Boolean(product);
  const isEditingDraft = product?.status === 'draft';

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    'basic' | 'descriptions' | 'pricing' | 'media' | 'deals' | 'dynamic' | 'seo'
  >('basic');

  // Form States matching ProductForm
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlugEdited, setCustomSlugEdited] = useState(false);
  const [brandOptions, setBrandOptions] = useState<BrandRecord[]>([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');

  const [longDescription, setLongDescription] = useState('');
  const [detailsDescription, setDetailsDescription] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const [subscriptionDurations, setSubscriptionDurations] = useState<SubscriptionDuration[]>([]);
  const [ebookPriceINR, setEbookPriceINR] = useState('');
  const [ebookPriceUSD, setEbookPriceUSD] = useState('');

  const [hasLifetime, setHasLifetime] = useState(false);
  const [lifetimePrice, setLifetimePrice] = useState('');
  const [lifetimePriceINR, setLifetimePriceINR] = useState('');
  const [lifetimePriceUSD, setLifetimePriceUSD] = useState('');

  const [hasMembership, setHasMembership] = useState(false);
  const [membershipPrice, setMembershipPrice] = useState('');
  const [membershipPriceINR, setMembershipPriceINR] = useState('');
  const [membershipPriceUSD, setMembershipPriceUSD] = useState('');

  const [strikethroughPriceINR, setStrikethroughPriceINR] = useState('');
  const [strikethroughPriceUSD, setStrikethroughPriceUSD] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newAddImageUrl, setNewAddImageUrl] = useState('');

  const [videoUrl, setVideoUrl] = useState('');
  const [activationVideoUrl, setActivationVideoUrl] = useState('');
  const [instagramReels, setInstagramReels] = useState<string[]>([]);
  const [newReelUrl, setNewReelUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');

  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('active');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [keyFeatures, setKeyFeatures] = useState<Feature[]>([]);
  const [systemRequirements, setSystemRequirements] = useState<Requirement[]>([]);

  // Deal Fields
  const [isDeal, setIsDeal] = useState(false);
  const [dealStartDate, setDealStartDate] = useState('');
  const [dealStartTime, setDealStartTime] = useState('');
  const [dealEndDate, setDealEndDate] = useState('');
  const [dealEndTime, setDealEndTime] = useState('');

  const [dealEbookPriceINR, setDealEbookPriceINR] = useState('');
  const [dealEbookPriceUSD, setDealEbookPriceUSD] = useState('');

  const [dealLifetimePriceINR, setDealLifetimePriceINR] = useState('');
  const [dealLifetimePriceUSD, setDealLifetimePriceUSD] = useState('');

  const [dealMembershipPriceINR, setDealMembershipPriceINR] = useState('');
  const [dealMembershipPriceUSD, setDealMembershipPriceUSD] = useState('');

  const [dealSubscriptionDurations, setDealSubscriptionDurations] = useState<SubscriptionDuration[]>([]);
  const [dealSubscriptions, setDealSubscriptions] = useState<SubscriptionDuration[]>([]);

  // Free Product Fields
  const [isFreeProduct, setIsFreeProduct] = useState(false);
  const [freeProductStartDate, setFreeProductStartDate] = useState('');
  const [freeProductStartTime, setFreeProductStartTime] = useState('');
  const [freeProductEndDate, setFreeProductEndDate] = useState('');
  const [freeProductEndTime, setFreeProductEndTime] = useState('');

  // Icon Picker Helper State
  const [activeIconPickerIndex, setActiveIconPickerIndex] = useState<{ type: 'feature' | 'requirement'; index: number } | null>(null);

  // UI Status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    brandApi.list().then(setBrandOptions).catch(() => setBrandOptions([]));
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setVersion(product.version || '');
      setSlug(product.slug || '');
      setCustomSlugEdited(true);
      setCategory(product.category || '');
      setBrand(product.brand || product.software || '');

      setLongDescription(product.longDescription || product.description?.join('\n\n') || '');
      setDetailsDescription(product.detailsDescription || '');

      setSeoTitle(product.seoTitle || '');
      setSeoDescription(product.seoDescription || '');
      setSeoKeywords(product.seoKeywords ? product.seoKeywords.join(', ') : '');

      setSubscriptionDurations(product.subscriptionDurations || []);
      setEbookPriceINR(product.ebookPriceINR || (product.price ? String(product.price) : ''));
      setEbookPriceUSD(product.ebookPriceUSD || '');

      setHasLifetime(Boolean(product.hasLifetime));
      setLifetimePrice(product.lifetimePrice || '');
      setLifetimePriceINR(product.lifetimePriceINR || '');
      setLifetimePriceUSD(product.lifetimePriceUSD || '');

      setHasMembership(Boolean(product.hasMembership));
      setMembershipPrice(product.membershipPrice || '');
      setMembershipPriceINR(product.membershipPriceINR || '');
      setMembershipPriceUSD(product.membershipPriceUSD || '');

      setStrikethroughPriceINR(product.strikethroughPriceINR || (product.oldPrice ? String(product.oldPrice) : ''));
      setStrikethroughPriceUSD(product.strikethroughPriceUSD || '');

      setImageUrl(product.imageUrl || product.images?.[0] || '');
      setAdditionalImages(product.additionalImages || (product.images?.slice(1) || []));

      setVideoUrl(product.videoUrl || '');
      setActivationVideoUrl(product.activationVideoUrl || '');
      setInstagramReels(product.instagramReels || []);
      setDriveLink(product.driveLink || '');

      setStatus(product.status || 'active');
      setIsBestSeller(Boolean(product.isBestSeller));
      setIsOutOfStock(Boolean(product.isOutOfStock));

      setFaqs(product.faqs || []);
      setKeyFeatures(product.keyFeatures || []);
      setSystemRequirements(product.systemRequirements || []);

      setIsDeal(Boolean(product.isDeal));
      setDealStartDate(product.dealStartDate || '');
      setDealStartTime(product.dealStartTime || '');
      setDealEndDate(product.dealEndDate || '');
      setDealEndTime(product.dealEndTime || '');

      setDealEbookPriceINR(product.dealEbookPriceINR || '');
      setDealEbookPriceUSD(product.dealEbookPriceUSD || '');
      setDealLifetimePriceINR(product.dealLifetimePriceINR || '');
      setDealLifetimePriceUSD(product.dealLifetimePriceUSD || '');
      setDealMembershipPriceINR(product.dealMembershipPriceINR || '');
      setDealMembershipPriceUSD(product.dealMembershipPriceUSD || '');

      setDealSubscriptionDurations(product.dealSubscriptionDurations || []);
      setDealSubscriptions(product.dealSubscriptions || []);

      setIsFreeProduct(Boolean(product.isFreeProduct));
      setFreeProductStartDate(product.freeProductStartDate || '');
      setFreeProductStartTime(product.freeProductStartTime || '');
      setFreeProductEndDate(product.freeProductEndDate || '');
      setFreeProductEndTime(product.freeProductEndTime || '');
    } else {
      // Create defaults
      setName('');
      setVersion('');
      setSlug('');
      setCustomSlugEdited(false);
      setCategory('');
      setBrand('');

      setLongDescription('');
      setDetailsDescription('');

      setSeoTitle('');
      setSeoDescription('');
      setSeoKeywords('');

      setSubscriptionDurations([]);
      setEbookPriceINR('');
      setEbookPriceUSD('');

      setHasLifetime(false);
      setLifetimePrice('');
      setLifetimePriceINR('');
      setLifetimePriceUSD('');

      setHasMembership(false);
      setMembershipPrice('');
      setMembershipPriceINR('');
      setMembershipPriceUSD('');

      setStrikethroughPriceINR('');
      setStrikethroughPriceUSD('');

      setImageUrl('');
      setAdditionalImages([]);
      setNewAddImageUrl('');

      setVideoUrl('');
      setActivationVideoUrl('');
      setInstagramReels([]);
      setNewReelUrl('');
      setDriveLink('');

      setStatus('active');
      setIsBestSeller(false);
      setIsOutOfStock(false);

      setFaqs([]);
      setKeyFeatures([]);
      setSystemRequirements([]);

      setIsDeal(false);
      setDealStartDate('');
      setDealStartTime('');
      setDealEndDate('');
      setDealEndTime('');

      setDealEbookPriceINR('');
      setDealEbookPriceUSD('');
      setDealLifetimePriceINR('');
      setDealLifetimePriceUSD('');
      setDealMembershipPriceINR('');
      setDealMembershipPriceUSD('');

      setDealSubscriptionDurations([]);
      setDealSubscriptions([]);

      setIsFreeProduct(false);
      setFreeProductStartDate('');
      setFreeProductStartTime('');
      setFreeProductEndDate('');
      setFreeProductEndTime('');
    }
    setError(null);
    setSuccessMsg(null);
  }, [product, isOpen]);

  // Name & Slug change handlers
  const handleNameChange = (val: string) => {
    setName(val);
    if (!customSlugEdited) {
      const base = version ? `${val} ${version}` : val;
      setSlug(slugify(base));
    }
  };

  const handleVersionChange = (val: string) => {
    setVersion(val);
    if (!customSlugEdited) {
      const base = val ? `${name} ${val}` : name;
      setSlug(slugify(base));
    }
  };

  const handleSlugChange = (val: string) => {
    setCustomSlugEdited(true);
    setSlug(slugify(val));
  };

  // Additional Image Handlers
  const handleAddAdditionalImage = () => {
    if (!newAddImageUrl.trim()) return;
    setAdditionalImages([...additionalImages, newAddImageUrl.trim()]);
    setNewAddImageUrl('');
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, idx) => idx !== index));
  };

  // Instagram Reel Handlers
  const handleAddReel = () => {
    if (!newReelUrl.trim()) return;
    setInstagramReels([...instagramReels, newReelUrl.trim()]);
    setNewReelUrl('');
  };

  const handleRemoveReel = (index: number) => {
    setInstagramReels(instagramReels.filter((_, idx) => idx !== index));
  };

  // Subscription Durations Handlers
  const handleAddSubDuration = () => {
    setSubscriptionDurations([
      ...subscriptionDurations,
      { duration: '', price: '', priceINR: '', priceUSD: '' }
    ]);
  };

  const handleUpdateSubDuration = (
    index: number,
    field: keyof SubscriptionDuration,
    val: string
  ) => {
    const updated = [...subscriptionDurations];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'priceINR' && !updated[index].price) {
      updated[index].price = val;
    }
    setSubscriptionDurations(updated);
  };

  const handleRemoveSubDuration = (index: number) => {
    setSubscriptionDurations(subscriptionDurations.filter((_, idx) => idx !== index));
  };

  // FAQ Handlers
  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleUpdateFAQ = (index: number, field: keyof FAQ, val: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: val };
    setFaqs(updated);
  };

  const handleRemoveFAQ = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  // Key Feature Handlers
  const handleAddFeature = () => {
    setKeyFeatures([
      ...keyFeatures,
      { icon: 'CheckCircle', title: '', description: '' }
    ]);
  };

  const handleUpdateFeature = (index: number, field: keyof Feature, val: string) => {
    const updated = [...keyFeatures];
    updated[index] = { ...updated[index], [field]: val };
    setKeyFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, idx) => idx !== index));
  };

  // System Requirement Handlers
  const handleAddRequirement = () => {
    setSystemRequirements([
      ...systemRequirements,
      { icon: 'Monitor', title: '', description: '' }
    ]);
  };

  const handleUpdateRequirement = (index: number, field: keyof Requirement, val: string) => {
    const updated = [...systemRequirements];
    updated[index] = { ...updated[index], [field]: val };
    setSystemRequirements(updated);
  };

  const handleRemoveRequirement = (index: number) => {
    setSystemRequirements(systemRequirements.filter((_, idx) => idx !== index));
  };

  // Render Lucide Icon helper
  const renderLucideIcon = (iconName: string, className = 'w-4 h-4') => {
    const IconComp = (LucideIcons as any)[iconName] || LucideIcons.CheckCircle;
    return <IconComp className={className} />;
  };

  // Form Save Execution
  const handleSave = async (isDraftSave = false) => {
    setError(null);
    setSuccessMsg(null);

    // Validation for non-draft / published items
    if (!isDraftSave && !name.trim()) {
      setError('Product Name is required.');
      setActiveTab('basic');
      return;
    }

    const enteredPrices = [
      Number(ebookPriceINR),
      hasLifetime ? Number(lifetimePriceINR) : 0,
      hasMembership ? Number(membershipPriceINR) : 0,
      ...subscriptionDurations.map((row) => Number(row.priceINR || row.price)),
    ].filter((amount) => amount > 0);
    const calculatedPrice = enteredPrices.length ? Math.min(...enteredPrices) : 0;
    const calculatedOldPrice = Number(strikethroughPriceINR) || 0;

    setIsSubmitting(true);

    const targetStatus: 'active' | 'inactive' | 'draft' = isDraftSave
      ? 'draft'
      : isEditingDraft
      ? 'active'
      : status;

    const keywordsArray = seoKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const imagesList = [imageUrl.trim(), ...additionalImages.filter(Boolean)].filter(Boolean);

    const payload: Partial<Product> & { name: string; price: number } = {
      name: name.trim() || 'Untitled Product',
      version: version.trim(),
      slug: slug ? slugify(slug) : slugify(version ? `${name} ${version}` : name || 'product'),
      categorySlug: category ? category.toLowerCase().replace(/\s+/g, '-') : '',
      category,
      software: brand,
      brand,
      company: brand,
      price: calculatedPrice,
      oldPrice: calculatedOldPrice,
      format: '',
      fileSize: '',
      badge: isBestSeller ? 'Bestseller' : '',
      isBestSeller,
      isOutOfStock,
      status: targetStatus,

      shortDescription: '',
      longDescription,
      detailsDescription,
      description: longDescription.trim() ? [longDescription] : [],
      includedFiles: [],
      images: imagesList,
      imageUrl: imageUrl.trim(),
      additionalImages,

      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoKeywords: keywordsArray,

      subscriptionDurations,
      subscriptions: subscriptionDurations,
      ebookPriceINR,
      ebookPriceUSD,

      hasLifetime,
      lifetimePrice,
      lifetimePriceINR,
      lifetimePriceUSD,

      hasMembership,
      membershipPrice,
      membershipPriceINR,
      membershipPriceUSD,

      strikethroughPriceINR,
      strikethroughPriceUSD,

      videoUrl: videoUrl.trim(),
      activationVideoUrl: activationVideoUrl.trim(),
      instagramReels,
      driveLink: driveLink.trim(),

      faqs: faqs.filter((item) => item.question.trim() || item.answer.trim()),
      keyFeatures: keyFeatures.filter((item) => item.title.trim() || item.description.trim()),
      systemRequirements: systemRequirements.filter((item) => item.title.trim() || item.description.trim()),

      isDeal,
      dealStartDate,
      dealStartTime,
      dealEndDate,
      dealEndTime,
      dealEbookPriceINR,
      dealEbookPriceUSD,
      dealLifetimePriceINR,
      dealLifetimePriceUSD,
      dealMembershipPriceINR,
      dealMembershipPriceUSD,
      dealSubscriptionDurations,
      dealSubscriptions,

      isFreeProduct,
      freeProductStartDate,
      freeProductStartTime,
      freeProductEndDate,
      freeProductEndTime
    };

    const result = await Promise.resolve(onSubmit(payload, isDraftSave));
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to save product.');
      return;
    }

    setSuccessMsg(
      isDraftSave
        ? 'Product saved as draft!'
        : isEditingDraft
        ? 'Draft published successfully as Active product!'
        : 'Product saved successfully!'
    );

    setTimeout(() => {
      onClose();
    }, 450);
  };

  if (!asPage && !isOpen) return null;

  const steps = [
    { id: 'basic' as const, label: 'Basic info', icon: FileText },
    { id: 'descriptions' as const, label: 'Descriptions', icon: Sliders },
    { id: 'pricing' as const, label: 'Pricing', icon: DollarSign },
    { id: 'media' as const, label: 'Media & links', icon: ImageIcon },
    { id: 'deals' as const, label: 'Deals & free', icon: Gift },
    { id: 'dynamic' as const, label: 'Features & FAQs', icon: Layers },
    { id: 'seo' as const, label: 'SEO', icon: HelpCircle },
  ];

  const stepIndex = steps.findIndex((step) => step.id === activeTab);

  const pageTitle = isEditing
    ? isEditingDraft
      ? `Publish draft`
      : `Edit product`
    : 'Add product';

  return (
    <div className={asPage ? 'text-slate-900' : 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in'}>
      <div className={asPage ? 'flex flex-col gap-5 lg:flex-row lg:items-start w-full' : 'bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl flex flex-col h-[94vh] overflow-hidden text-slate-900 animate-scale-up'}>
        {asPage && (
          <aside className="w-full lg:sticky lg:top-4 lg:w-60 shrink-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">Sections</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const selected = activeTab === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveTab(step.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold cursor-pointer ${
                      selected ? 'bg-amber-50 text-[#D97706]' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] ${selected ? 'bg-[#F5A000] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {index + 1}
                    </span>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <div className={asPage ? 'min-w-0 flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col' : 'contents'}>
        {asPage ? (
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">{pageTitle}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {name.trim() || 'Untitled product'} · {status}
            </p>
          </div>
        ) : (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-[#F5A000] rounded-xl font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {isEditing
                  ? isEditingDraft
                    ? `Edit & Publish Draft: ${product?.name}`
                    : `Edit Product: ${product?.name}`
                  : 'Add New Product'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure full product state including subscriptions, pricing tiers, media, deals & SEO
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        )}

        {!asPage && (
        <div className="flex items-center gap-1 px-6 bg-slate-100/70 border-b border-slate-200 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Basic Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('descriptions')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'descriptions'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Rich Descriptions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Pricing & Subscriptions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>4. Media & Links</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'deals'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>5. Deals & Free Offer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dynamic')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dynamic'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>6. Features, FAQs & Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'seo'
                ? 'border-[#F5A000] text-[#F5A000] bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>7. SEO Metadata</span>
          </button>
        </div>
        )}

        <div className={asPage ? 'p-6 sm:p-8 space-y-6 text-sm' : 'p-6 overflow-y-auto flex-1 space-y-6 text-xs'}>
          
          {/* Notifications Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-[#F5A000]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Basic Product Info & Categorization
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AutoCAD Structural Drawings Bundle"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  />
                  <p className="text-[11px] text-slate-500">Shown as the product title on the store and in search.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Version</label>
                  <input
                    type="text"
                    placeholder="e.g. 2025.1"
                    value={version}
                    onChange={(e) => handleVersionChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  />
                  <p className="text-[11px] text-slate-500">Release or file version shown next to the product name.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">URL Slug</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 font-mono text-[11px] rounded-l-xl">
                    /product/
                  </span>
                  <input
                    type="text"
                    placeholder="autocad-structural-drawings"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Public URL, for example /product/autocad-structural-drawings. Leave blank to generate it from the name.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Brand *</label>
                  <select
                    value={brandOptions.find((item) => item.name === brand)?.slug || brand}
                    onChange={(event) => {
                      if (!event.target.value) {
                        setBrand('');
                        setCategory('');
                        return;
                      }
                      const next = brandOptions.find((item) => item.slug === event.target.value);
                      if (!next) return;
                      setBrand(next.name);
                      setCategory('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="">{brandOptions.length === 0 ? 'Loading brands...' : 'Select brand'}</option>
                    {brandOptions.map((item) => (
                      <option key={item.slug} value={item.slug}>{item.name}</option>
                    ))}
                    {brand && !brandOptions.some((item) => item.name === brand) && (
                      <option value={brand}>{brand}</option>
                    )}
                  </select>
                  <p className="text-[11px] text-slate-500">Company group, such as Autodesk. Add more under Admin → Brands.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Category *</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {(brandOptions.find((item) => item.name === brand)?.categories || []).map((item) => (
                      <option key={item.slug} value={item.name}>{item.name}</option>
                    ))}
                    {category && !(brandOptions.find((item) => item.name === brand)?.categories || []).some((item) => item.name === category) && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                  <p className="text-[11px] text-slate-500">Product type inside the selected brand, such as AutoCAD.</p>
                </div>
              </div>

              {/* Status & Flags */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Product Status & Flags
                </span>
                <p className="text-[11px] text-slate-500">Active appears in the store. Draft stays hidden. Inactive is saved but not sold. Best Seller and Out of Stock control badges and checkout.</p>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Status:</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="active">Active (Published)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000]"
                    />
                    <span>Best Seller Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-700">
                    <input
                      type="checkbox"
                      checked={isOutOfStock}
                      onChange={(e) => setIsOutOfStock(e.target.checked)}
                      className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                    />
                    <span>Out of Stock</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RICH DESCRIPTIONS */}
          {activeTab === 'descriptions' && (
            <div className="space-y-6 animate-fade-in">
              <RichTextEditor
                label="Long Description (Rich HTML Content)"
                value={longDescription}
                onChange={setLongDescription}
                placeholder="Enter detailed description, features breakdown, usage guide..."
                editorHeight="min-h-[180px] max-h-[300px]"
              />

              <RichTextEditor
                label="Details Description / System Compatibility Notes"
                value={detailsDescription}
                onChange={setDetailsDescription}
                placeholder="Enter technical details, file structure, compatibility guidelines..."
                editorHeight="min-h-[120px] max-h-[220px]"
              />
            </div>
          )}

          {/* TAB 3: PRICING & SUBSCRIPTIONS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Subscription Duration Tiers
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSubDuration}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Duration Tier</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {subscriptionDurations.map((sub, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-3 border border-slate-200 rounded-xl items-center"
                    >
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 1 Month / 1 Year"
                          value={sub.duration}
                          onChange={(e) =>
                            handleUpdateSubDuration(idx, 'duration', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Price INR (₹)
                        </label>
                        <input
                          type="text"
                          placeholder="499"
                          value={sub.priceINR}
                          onChange={(e) =>
                            handleUpdateSubDuration(idx, 'priceINR', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Price USD ($)
                        </label>
                        <input
                          type="text"
                          placeholder="6.99"
                          value={sub.priceUSD}
                          onChange={(e) =>
                            handleUpdateSubDuration(idx, 'priceUSD', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Trial Days (Opt)
                        </label>
                        <input
                          type="text"
                          placeholder="7"
                          value={sub.trialDays || ''}
                          onChange={(e) =>
                            handleUpdateSubDuration(idx, 'trialDays', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubDuration(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* eBook & Strikethrough Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Single Purchase INR (₹)</label>
                  <input
                    type="text"
                    placeholder="499"
                    value={ebookPriceINR}
                    onChange={(e) => setEbookPriceINR(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Single Purchase USD ($)</label>
                  <input
                    type="text"
                    placeholder="6.99"
                    value={ebookPriceUSD}
                    onChange={(e) => setEbookPriceUSD(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Strikethrough Price INR (₹)</label>
                  <input
                    type="text"
                    placeholder="999"
                    value={strikethroughPriceINR}
                    onChange={(e) => setStrikethroughPriceINR(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-500 line-through"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Strikethrough Price USD ($)</label>
                  <input
                    type="text"
                    placeholder="12.99"
                    value={strikethroughPriceUSD}
                    onChange={(e) => setStrikethroughPriceUSD(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-500 line-through"
                  />
                </div>
              </div>

              {/* Lifetime Pricing Toggles & Tiers */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-extrabold text-slate-900">
                  <input
                    type="checkbox"
                    checked={hasLifetime}
                    onChange={(e) => setHasLifetime(e.target.checked)}
                    className="w-4 h-4 text-[#F5A000] rounded"
                  />
                  <span>Enable Lifetime Pricing Option</span>
                </label>

                {hasLifetime && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Lifetime Price</label>
                      <input
                        type="text"
                        placeholder="4999"
                        value={lifetimePrice}
                        onChange={(e) => setLifetimePrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Lifetime Price INR (₹)</label>
                      <input
                        type="text"
                        placeholder="4999"
                        value={lifetimePriceINR}
                        onChange={(e) => setLifetimePriceINR(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-extrabold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Lifetime Price USD ($)</label>
                      <input
                        type="text"
                        placeholder="59.99"
                        value={lifetimePriceUSD}
                        onChange={(e) => setLifetimePriceUSD(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Membership Pricing Toggles & Tiers */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-extrabold text-slate-900">
                  <input
                    type="checkbox"
                    checked={hasMembership}
                    onChange={(e) => setHasMembership(e.target.checked)}
                    className="w-4 h-4 text-[#F5A000] rounded"
                  />
                  <span>Enable Membership Access Tier</span>
                </label>

                {hasMembership && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Membership Price</label>
                      <input
                        type="text"
                        placeholder="1999"
                        value={membershipPrice}
                        onChange={(e) => setMembershipPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Membership Price INR (₹)</label>
                      <input
                        type="text"
                        placeholder="1999"
                        value={membershipPriceINR}
                        onChange={(e) => setMembershipPriceINR(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-extrabold text-purple-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Membership Price USD ($)</label>
                      <input
                        type="text"
                        placeholder="24.99"
                        value={membershipPriceUSD}
                        onChange={(e) => setMembershipPriceUSD(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & LINKS */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fade-in">
              {/* Primary Image URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Primary Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              {/* Additional Images List */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Additional Gallery Images</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newAddImageUrl}
                    onChange={(e) => setNewAddImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdditionalImage}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl shrink-0"
                  >
                    + Add Image
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {additionalImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-slate-200 bg-slate-100 h-24 overflow-hidden group"
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL & Activation Video URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Product Video / Demo URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Activation Guide Video URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={activationVideoUrl}
                    onChange={(e) => setActivationVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Instagram Reels & Drive Link */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Instagram Reels URLs</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://instagram.com/reel/..."
                      value={newReelUrl}
                      onChange={(e) => setNewReelUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddReel}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl shrink-0"
                    >
                      + Add Reel
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    {instagramReels.map((reel, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                      >
                        <span>{reel}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveReel(idx)}
                          className="text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-emerald-600" />
                    <span>Google Drive / Storage Download Link</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEALS & FREE OFFER */}
          {activeTab === 'deals' && (
            <div className="space-y-6 animate-fade-in">
              {/* Special Deal Section */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4">
                <label className="flex items-center gap-2 cursor-pointer font-extrabold text-amber-950">
                  <input
                    type="checkbox"
                    checked={isDeal}
                    onChange={(e) => setIsDeal(e.target.checked)}
                    className="w-4 h-4 text-[#F5A000] rounded"
                  />
                  <span>Enable Limited-Time Special Deal</span>
                </label>

                {isDeal && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">Deal Start Date</label>
                        <input
                          type="date"
                          value={dealStartDate}
                          onChange={(e) => setDealStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">Deal Start Time</label>
                        <input
                          type="time"
                          value={dealStartTime}
                          onChange={(e) => setDealStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">Deal End Date</label>
                        <input
                          type="date"
                          value={dealEndDate}
                          onChange={(e) => setDealEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">Deal End Time</label>
                        <input
                          type="time"
                          value={dealEndTime}
                          onChange={(e) => setDealEndTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">
                          Deal Price INR (₹)
                        </label>
                        <input
                          type="text"
                          placeholder="299"
                          value={dealEbookPriceINR}
                          onChange={(e) => setDealEbookPriceINR(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-extrabold text-amber-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">
                          Deal Lifetime Price INR (₹)
                        </label>
                        <input
                          type="text"
                          placeholder="2999"
                          value={dealLifetimePriceINR}
                          onChange={(e) => setDealLifetimePriceINR(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-extrabold text-amber-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-amber-900 block mb-1">
                          Deal Membership Price INR (₹)
                        </label>
                        <input
                          type="text"
                          placeholder="1499"
                          value={dealMembershipPriceINR}
                          onChange={(e) => setDealMembershipPriceINR(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-extrabold text-amber-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Free Product Offer Section */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4">
                <label className="flex items-center gap-2 cursor-pointer font-extrabold text-emerald-950">
                  <input
                    type="checkbox"
                    checked={isFreeProduct}
                    onChange={(e) => setIsFreeProduct(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Mark as Free Product Promotion</span>
                </label>

                {isFreeProduct && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-emerald-900 block mb-1">Free Start Date</label>
                      <input
                        type="date"
                        value={freeProductStartDate}
                        onChange={(e) => setFreeProductStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-900 block mb-1">Free Start Time</label>
                      <input
                        type="time"
                        value={freeProductStartTime}
                        onChange={(e) => setFreeProductStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-900 block mb-1">Free End Date</label>
                      <input
                        type="date"
                        value={freeProductEndDate}
                        onChange={(e) => setFreeProductEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-900 block mb-1">Free End Time</label>
                      <input
                        type="time"
                        value={freeProductEndTime}
                        onChange={(e) => setFreeProductEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DYNAMIC LISTS (FEATURES, FAQS, REQUIREMENTS) */}
          {activeTab === 'dynamic' && (
            <div className="space-y-6 animate-fade-in">
              {/* Key Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Key Features List ({keyFeatures.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1 bg-[#F5A000] text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Feature</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {keyFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Icon
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveIconPickerIndex({ type: 'feature', index: idx })}
                          className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 font-bold"
                        >
                          {renderLucideIcon(feat.icon || 'CheckCircle', 'w-3.5 h-3.5 text-[#F5A000]')}
                          <span className="font-mono text-[10px] truncate">{feat.icon || 'CheckCircle'}</span>
                        </button>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          placeholder="Feature Title..."
                          value={feat.title}
                          onChange={(e) => handleUpdateFeature(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          placeholder="Feature Description..."
                          value={feat.description}
                          onChange={(e) =>
                            handleUpdateFeature(idx, 'description', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Frequently Asked Questions ({faqs.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddFAQ}
                    className="px-3 py-1 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Question..."
                          value={faq.question}
                          onChange={(e) => handleUpdateFAQ(idx, 'question', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFAQ(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Answer details..."
                        value={faq.answer}
                        onChange={(e) => handleUpdateFAQ(idx, 'answer', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* System Requirements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    System Requirements ({systemRequirements.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3 py-1 bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Requirement</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {systemRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Icon
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveIconPickerIndex({ type: 'requirement', index: idx })
                          }
                          className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 font-bold"
                        >
                          {renderLucideIcon(req.icon || 'Monitor', 'w-3.5 h-3.5 text-blue-600')}
                          <span className="font-mono text-[10px] truncate">{req.icon || 'Monitor'}</span>
                        </button>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Requirement Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Operating System"
                          value={req.title}
                          onChange={(e) => handleUpdateRequirement(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Requirement Details
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Windows 10/11 64-bit"
                          value={req.description}
                          onChange={(e) =>
                            handleUpdateRequirement(idx, 'description', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SEO METADATA */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">SEO Title</label>
                  <span
                    className={`text-[10px] font-mono ${
                      seoTitle.length > 70 ? 'text-rose-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {seoTitle.length} / 70 max
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  placeholder="Defaults to product name"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">SEO Description</label>
                  <span
                    className={`text-[10px] font-mono ${
                      seoDescription.length > 172 ? 'text-rose-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {seoDescription.length} / 172 max
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={172}
                  placeholder="Summary for search engines..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">SEO Keywords (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="autocad, drawings, civil engineering, cad templates"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>
          )}

        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-bold">Current Target Status:</span>
            <span
              className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase ${
                status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'draft'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {asPage && (
              <button
                type="button"
                disabled={stepIndex <= 0}
                onClick={() => {
                  const previous = steps[stepIndex - 1];
                  if (previous) setActiveTab(previous.id);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
            {asPage && stepIndex < steps.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  const next = steps[stepIndex + 1];
                  if (next) setActiveTab(next.id);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Next
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            {/* Save as Draft Button */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>

            {/* Main Submit Button */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isEditing
                  ? isEditingDraft
                    ? 'Publish Draft Product'
                    : 'Update Product'
                  : status === 'draft'
                  ? 'Save & Publish Draft'
                  : 'Add Product'}
              </span>
            </button>
          </div>
        </div>
        </div>

      </div>

      {/* Icon Picker Popover */}
      {activeIconPickerIndex && (
        <IconPickerModal
          isOpen={true}
          value={
            activeIconPickerIndex.type === 'feature'
              ? keyFeatures[activeIconPickerIndex.index]?.icon || 'CheckCircle'
              : systemRequirements[activeIconPickerIndex.index]?.icon || 'Monitor'
          }
          onChange={(newIcon) => {
            if (activeIconPickerIndex.type === 'feature') {
              handleUpdateFeature(activeIconPickerIndex.index, 'icon', newIcon);
            } else {
              handleUpdateRequirement(activeIconPickerIndex.index, 'icon', newIcon);
            }
          }}
          onClose={() => setActiveIconPickerIndex(null)}
        />
      )}
    </div>
  );
};

export default ProductFormModal;
