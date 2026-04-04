// app/(app)/admin/testimonials/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Star, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimonial { id: string; name: string; role: string; content: string; rating: number; isActive: boolean; createdAt: string; }

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 });

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => { try { setTestimonials(await adminAPI.getTestimonials()); } catch { toast.error('Failed to load'); } finally { setLoading(false); } };
  const handleSubmit = async () => { try { if (editing) await adminAPI.updateTestimonial(editing.id, form); else await adminAPI.createTestimonial(form); toast.success(editing ? 'Updated' : 'Created'); setModalOpen(false); reset(); fetchTestimonials(); } catch { toast.error('Failed to save'); } };
  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await adminAPI.deleteTestimonial(id); toast.success('Deleted'); fetchTestimonials(); } };
  const reset = () => { setEditing(null); setForm({ name: '', role: '', content: '', rating: 5 }); };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>;

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold text-gray-900">Testimonials</h1><p className="text-sm text-gray-500">Manage customer reviews</p></div><Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Testimonial</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{testimonials.map(t => (<Card key={t.id} hover><CardBody className="p-5"><div className="flex justify-between items-start"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-orange-600" /></div><div><h3 className="font-semibold">{t.name}</h3><p className="text-xs text-gray-500">{t.role}</p></div></div><div className="flex gap-1"><button onClick={() => { setEditing(t); setForm({ name: t.name, role: t.role, content: t.content, rating: t.rating }); setModalOpen(true); }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></div><div className="flex mt-2">{[...Array(t.rating)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-orange-500 text-orange-500" />))}</div><p className="text-sm text-gray-600 mt-2 line-clamp-3">"{t.content}"</p><p className="text-xs text-gray-400 mt-2">{new Date(t.createdAt).toLocaleDateString()}</p></CardBody></Card>))}</div>
        </div>
        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title={editing ? 'Edit Testimonial' : 'Add Testimonial'} onConfirm={handleSubmit} confirmText={editing ? 'Update' : 'Create'}><div className="space-y-4"><Input label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /><Input label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} /><div><label className="text-sm font-medium">Content</label><textarea rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full mt-1 p-2 border rounded-lg" /></div><div><label className="text-sm font-medium">Rating</label><select value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg">{[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}</select></div></div></Modal>
      </div>
    </RoleBasedRoute>
  );
}