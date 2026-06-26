'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { getSettings, updateSettings } from '../../lib/firestore';
import type { SiteSettings } from '../../../shared/types';

const DEFAULT_SETTINGS: SiteSettings = {
  announcementBarEnabled: false,
  announcementBarText: '',
  heroSlides: [],
  featuredProductIds: [],
  shippingRates: { colombo: 250, westernProvince: 300, outstation: 400 },
  minOrderForFreeShipping: 2500,
  whatsappNumber: '',
  contactEmail: '',
  businessAddress: '',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  metaPixelId: '',
  tiktokPixelId: '',
};

type SettingsTab = 'general' | 'shipping' | 'pixels' | 'social';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{props.label}</label>
    <input
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [featuredInput, setFeaturedInput] = useState('');

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        setSettings(s);
        setFeaturedInput((s.featuredProductIds ?? []).join(', '));
      }
      setLoading(false);
    });
  }, []);

  const update = (field: keyof SiteSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = {
        ...settings,
        featuredProductIds: featuredInput.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await updateSettings(toSave);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: '⚙️' },
    { key: 'shipping', label: 'Shipping', icon: '🚚' },
    { key: 'social', label: 'Social & Contact', icon: '🌐' },
    { key: 'pixels', label: 'Tracking Pixels', icon: '📊' },
  ];


  if (loading) {
    return (
      <AdminLayout title="Settings" requiredPermission="settings_manage">
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" description="Configure store-wide settings including announcements, shipping rates, and social links." requiredPermission="settings_manage">
      <div className="max-w-3xl font-sans">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
            ) : '💾 Save Settings'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <h3 className="font-bold text-gray-800">General Settings</h3>

              {/* Announcement Bar */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => update('announcementBarEnabled', !settings.announcementBarEnabled)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${settings.announcementBarEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${settings.announcementBarEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="font-medium text-sm text-gray-700">Announcement Bar</span>
                </div>
                {settings.announcementBarEnabled && (
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Announcement Text</label>
                    <input
                      type="text"
                      value={settings.announcementBarText}
                      onChange={(e) => update('announcementBarText', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="🌿 Free delivery on orders over Rs. 2,500!"
                    />
                  </div>
                )}
              </div>

              {/* Featured Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Product IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={featuredInput}
                  onChange={(e) => setFeaturedInput(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="productId1, productId2, productId3, productId4"
                />
                <p className="text-xs text-gray-400 mt-1">Enter up to 4 Product IDs from Firestore to show on the homepage</p>
              </div>
            </>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <>
              <h3 className="font-bold text-gray-800">Shipping Rates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Colombo District (Rs.)"
                  type="number"
                  value={settings.shippingRates.colombo}
                  onChange={(e) => update('shippingRates', { ...settings.shippingRates, colombo: parseInt(e.target.value) })}
                />
                <Input
                  label="Western Province (Rs.)"
                  type="number"
                  value={settings.shippingRates.westernProvince}
                  onChange={(e) => update('shippingRates', { ...settings.shippingRates, westernProvince: parseInt(e.target.value) })}
                />
                <Input
                  label="Outstation (Rs.)"
                  type="number"
                  value={settings.shippingRates.outstation}
                  onChange={(e) => update('shippingRates', { ...settings.shippingRates, outstation: parseInt(e.target.value) })}
                />
                <Input
                  label="Min Order for Free Shipping (Rs.)"
                  type="number"
                  value={settings.minOrderForFreeShipping}
                  onChange={(e) => update('minOrderForFreeShipping', parseInt(e.target.value))}
                />
              </div>
            </>
          )}

          {/* Social & Contact Tab */}
          {activeTab === 'social' && (
            <>
              <h3 className="font-bold text-gray-800">Contact & Social Media</h3>
              <div className="space-y-4">
                <Input
                  label="WhatsApp Number (without +, e.g. +94 77 123 4567)"
                  value={settings.whatsappNumber}
                  onChange={(e) => update('whatsappNumber', e.target.value)}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => update('contactEmail', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                  <textarea
                    value={settings.businessAddress}
                    onChange={(e) => update('businessAddress', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
                <Input
                  label="Facebook Page URL"
                  value={settings.facebookUrl}
                  onChange={(e) => update('facebookUrl', e.target.value)}
                  placeholder="https://web.facebook.com/..."
                />
                <Input
                  label="Instagram URL"
                  value={settings.instagramUrl}
                  onChange={(e) => update('instagramUrl', e.target.value)}
                  placeholder="https://www.instagram.com/..."
                />
                <Input
                  label="TikTok URL"
                  value={settings.tiktokUrl}
                  onChange={(e) => update('tiktokUrl', e.target.value)}
                  placeholder="https://www.tiktok.com/..."
                />
              </div>
            </>
          )}

          {/* Pixels Tab */}
          {activeTab === 'pixels' && (
            <>
              <h3 className="font-bold text-gray-800">Tracking Pixels</h3>
              <div className="space-y-4">
                <Input
                  label="Meta (Facebook) Pixel ID"
                  value={settings.metaPixelId}
                  onChange={(e) => update('metaPixelId', e.target.value)}
                  placeholder="Enter your Pixel ID"
                />
                <Input
                  label="TikTok Pixel ID"
                  value={settings.tiktokPixelId}
                  onChange={(e) => update('tiktokPixelId', e.target.value)}
                  placeholder="Enter your TikTok Pixel ID"
                />
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  ℹ️ Pixel IDs are automatically embedded in the website. Save settings to apply changes.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
