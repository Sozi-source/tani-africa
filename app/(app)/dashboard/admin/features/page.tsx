// app/(app)/admin/features/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Edit2, Trash2, Truck, Package, Clock, Shield, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface FeatureFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

// Constants
const iconOptions = [
  { name: 'Truck', icon: Truck },
  { name: 'Package', icon: Package },
  { name: 'Clock', icon: Clock },
  { name: 'Shield', icon: Shield },
];

const colorOptions = [
  { name: 'Orange', value: 'from-orange-500 to-amber-500' },
  { name: 'Blue', value: 'from-blue-500 to-cyan-500' },
  { name: 'Green', value: 'from-green-500 to-emerald-500' },
  { name: 'Purple', value: 'from-purple-500 to-pink-500' },
];

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(i => i.name === iconName);
  return found?.icon || Truck;
};

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FeatureFormData>({
    title: '',
    description: '',
    icon: 'Truck',
    color: 'from-orange-500 to-amber-500',
    order: 0,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getFeatures();
      setFeatures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load features:', err);
      toast.error('Failed to load features');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateFeature(editing.id, form);
        toast.success('Feature updated successfully');
      } else {
        await adminAPI.createFeature(form);
        toast.success('Feature created successfully');
      }
      setModalOpen(false);
      resetForm();
      await fetchFeatures();
    } catch (err) {
      console.error('Failed to save feature:', err);
      toast.error(editing ? 'Failed to update feature' : 'Failed to create feature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteFeature(id);
      toast.success('Feature deleted successfully');
      await fetchFeatures();
    } catch (err) {
      console.error('Failed to delete feature:', err);
      toast.error('Failed to delete feature');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      icon: 'Truck',
      color: 'from-orange-500 to-amber-500',
      order: 0,
    });
  };

  const openEditModal = (feature: Feature) => {
    setEditing(feature);
    setForm({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      color: feature.color,
      order: feature.order,
    });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Features Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage landing page features and highlights</p>
              <p className="text-xs text-gray-400 mt-1">Total: {features.length} feature{features.length !== 1 ? 's' : ''}</p>
            </div>
            <Button 
              onClick={() => setModalOpen(true)} 
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </div>

          {/* Features Grid */}
          {features.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No features added yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Feature" to create your first feature</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => {
                const IconComponent = getIconComponent(feature.icon);
                return (
                  <Card key={feature.id} hover className="overflow-hidden group">
                    <CardBody className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`rounded-xl bg-gradient-to-r ${feature.color} p-2.5 shadow-md group-hover:scale-105 transition-transform`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(feature)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            title="Edit feature"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(feature.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete feature"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {feature.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Order: {feature.order}
                        </span>
                        {feature.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          title={editing ? 'Edit Feature' : 'Add New Feature'}
          onConfirm={handleSubmit}
          confirmText={editing ? 'Update Feature' : 'Create Feature'}
          confirmDisabled={submitting}
          showCancelButton
          cancelText="Cancel"
        >
          <div className="space-y-4">
            {/* Title */}
            <Input
              label="Feature Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Reliable Drivers"
              required
              autoFocus
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the feature in 1-2 sentences..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {iconOptions.map((icon) => (
                  <option key={icon.name} value={icon.name}>
                    {icon.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Scheme
              </label>
              <select
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {colorOptions.map((color) => (
                  <option key={color.name} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
              {/* Color Preview */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Preview:</span>
                <div className={`h-6 w-6 rounded bg-gradient-to-r ${form.color}`} />
                <span className="text-xs text-gray-400">Gradient preview</span>
              </div>
            </div>

            {/* Order */}
            <Input
              label="Display Order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              placeholder="0"
              helperText="Lower numbers appear first"
            />
          </div>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
}