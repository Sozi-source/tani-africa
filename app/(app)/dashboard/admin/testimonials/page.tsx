'use client';

import { useEffect, useState } from 'react';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminAPI } from '@/lib/api/admin';
import { Plus, Edit2, Trash2, Star, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await adminAPI.getTestimonials();
      setTestimonials(data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTestimonial) {
        await adminAPI.updateTestimonial(editingTestimonial.id, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await adminAPI.createTestimonial(formData);
        toast.success('Testimonial created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await adminAPI.deleteTestimonial(id);
        toast.success('Testimonial deleted successfully');
        fetchTestimonials();
      } catch (error) {
        toast.error('Failed to delete testimonial');
      }
    }
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      role: '',
      content: '',
      rating: 5,
    });
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
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
            <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
            <p className="mt-2 text-gray-600">Manage customer reviews and testimonials</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} hover>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(testimonial)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary-500 text-primary-500" />
                  ))}
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-3">"{testimonial.content}"</p>
                
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          showConfirmButton
          confirmText={editingTestimonial ? 'Update' : 'Create'}
          onConfirm={handleSubmit}
          showCancelButton
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Kamau"
              required
            />
            
            <Input
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Business Owner"
              required
            />
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Customer feedback..."
                required
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rating</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
}