import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Category } from '@/types/procurement';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Props extends PageProps {
    categories: {
        data: (Category & { procurements_count: number })[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function Index({ categories }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        reset();
        clearErrors();
        setSelectedCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const store = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const update = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        put(route('categories.update', selectedCategory.id), {
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
            },
        });
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        destroy(route('categories.destroy', selectedCategory.id), {
            onSuccess: () => setIsDeleteModalOpen(false),
            onError: () => {
                // Keep modal open, show error
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Master Data Kategori
                    </h2>
                    <PrimaryButton onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700">
                        + Tambah Kategori
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Master Kategori" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Backend General Errors (e.g., Delete constraint) */}
                    {/* @ts-ignore */}
                    {errors.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error! </strong>
                            {/* @ts-ignore */}
                            <span className="block sm:inline">{errors.error}</span>
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pengajuan</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Belum ada data kategori.
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.data.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-50 whitespace-nowrap">
                                                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{category.description || '-'}</td>
                                                <td className="px-6 py-4 text-center text-sm font-semibold text-indigo-600">
                                                    {category.procurements_count}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm space-x-3">
                                                    <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-900 font-medium">Edit</button>
                                                    <button onClick={() => openDeleteModal(category)} className="text-red-600 hover:text-red-900 font-medium">Hapus</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                    Menampilkan {categories.data.length} dari {categories.total} data
                                </span>
                                <div className="flex space-x-1 border rounded-md overflow-hidden bg-white">
                                    {categories.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm ${link.active ? 'bg-indigo-50 text-indigo-600 font-bold border-indigo-200' : 'text-gray-500 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} border-x border-gray-200 first:border-l-0 last:border-r-0`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveState={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={store} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Tambah Kategori Baru</h2>
                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Kategori" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi (Opsional)" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={update} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Edit Kategori</h2>
                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Kategori" />
                            <TextInput
                                id="edit_name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="edit_description" value="Deskripsi (Opsional)" />
                            <textarea
                                id="edit_description"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>Update</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <form onSubmit={handleDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Hapus Kategori?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus kategori <span className="font-bold">"{selectedCategory?.name}"</span>?
                        Aksi ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="bg-red-600 hover:bg-red-700" disabled={processing}>Ya, Hapus</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
