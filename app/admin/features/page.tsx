'use client';

import { useEffect, useState } from 'react';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminAPI } from '@/lib/api/admin';
import { Plus, Edit2, Trash2, GripVertical, Truck, Package, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

const iconOptions = [
  { name: 'Truck', icon: Truck },
  { name: 'Package', icon: Package },
  { name: 'Clock', icon: Clock },
  { name: 'Shield', icon: Shield },
];

const colorOptions = [
  { name: 'Primary', value: 'from-primary-500 to-primary-600' },
  { name: 'Secondary', value: 'from-secondary-500 to-secondary-600' },
  { name: 'Green', value: 'from-green-500 to-green-600' },
  { name: 'Purple', value: 'from-purple-500 to-purple-600' },
];

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Truck',
    color: 'from-primary-500 to-primary-600',
    order: 0,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const data = await adminAPI.getFeatures();
      setFeatures(data);
    } catch (error) {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingFeature) {
        await adminAPI.updateFeature(editingFeature.id, formData);
        toast.success('Feature updated successfully');
      } else {
        await adminAPI.createFeature(formData);
        toast.success('Feature created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to save feature');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      try {
        await adminAPI.deleteFeature(id);
        toast.success('Feature deleted successfully');
        fetchFeatures();
      } catch (error) {
        toast.error('Failed to delete feature');
      }
    }
  };

  const resetForm = () => {
    setEditingFeature(null);
    setFormData({
      title: '',
      description: '',
      icon: 'Truck',
      color: 'from-primary-500 to-primary-600',
      order: 0,
    });
  };

  const openEditModal = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      color: feature.color,
      order: feature.order,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Features Management</h1>
            <p className="mt-2 text-gray-600">Manage landing page features</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const IconComponent = iconOptions.find(i => i.name === feature.icon)?.icon || Truck;
            return (
              <Card key={feature.id} hover>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg bg-gradient-to-r ${feature.color} p-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(feature)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                  <div className="mt-2 text-xs text-gray-400">Order: {feature.order}</div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingFeature ? 'Edit Feature' : 'Add New Feature'}
          showConfirmButton
          confirmText={editingFeature ? 'Update' : 'Create'}
          onConfirm={handleSubmit}
          showCancelButton
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Reliable Drivers"
              required
            />
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the feature..."
                required
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Icon</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {iconOptions.map((icon) => (
                  <option key={icon.name} value={icon.name}>{icon.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                {colorOptions.map((color) => (
                  <option key={color.name} value={color.value}>{color.name}</option>
                ))}
              </select>
            </div>
            
            <Input
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              placeholder="0"
            />
          </div>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
}