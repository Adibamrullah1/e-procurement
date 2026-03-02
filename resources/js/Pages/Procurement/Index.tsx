import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Procurement } from '@/types/procurement';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StatusBadge from '@/Components/StatusBadge';
import { Plus, Search, Eye, Filter } from 'lucide-react';

interface Props extends PageProps {
    procurements: {
        data: Procurement[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { status?: string; search?: string };
    statuses: { value: string; label: string; color: string }[];
}

export default function Index({ procurements, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('procurements.index'),
            { search, status },
            { preserveState: true }
        );
    };

    const handleStatusFilter = (newStatus: string) => {
        setStatus(newStatus);
        router.get(
            route('procurements.index'),
            { search, status: newStatus },
            { preserveState: true }
        );
    };



    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold leading-tight text-gray-800 tracking-tight">
                        Daftar Pengadaan
                    </h2>
                    <Link
                        href={route('procurements.create')}
                        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" /> Buat Pengadaan
                    </Link>
                </div>
            }
        >
            <Head title="Daftar Pengadaan" />

            <div className="py-12 animate-fade-in">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Filters Context */}
                    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="w-full lg:w-1/3">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari kode atau judul pengadaan..."
                                        className="pl-11 block w-full border-gray-200 bg-gray-50 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors py-2.5 text-gray-700"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
                                <Filter className="w-4 h-4" /> Filter Status:
                            </div>
                            <button
                                onClick={() => handleStatusFilter('')}
                                className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 shadow-sm ${status === '' ? 'bg-brand-100 text-brand-800 border-none scale-105' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                            >
                                Semua
                            </button>
                            {statuses.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => handleStatusFilter(s.value)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 shadow-sm ${status === s.value ? `bg-${s.color}-100 text-${s.color}-800 border-none scale-105` : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white/90 backdrop-blur-xl shadow-md sm:rounded-2xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-surface-50/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Kode / Judul
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Kategori / Vendor
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Pemohon
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Total Biaya
                                        </th>
                                        <th scope="col" className="relative px-6 py-4">
                                            <span className="sr-only">Aksi</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {procurements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Search className="h-12 w-12 mb-3 opacity-20" />
                                                    <h3 className="text-base font-medium text-gray-900">Tidak ada pengadaan</h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Belum ada data atau tidak ada yang cocok dengan pencarian.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        procurements.data.map((procurement) => (
                                            <tr key={procurement.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">{procurement.code}</span>
                                                        <span className="text-sm text-gray-500">{procurement.title}</span>
                                                        <span className="text-xs text-gray-400 mt-1">{procurement.created_at}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900">{procurement.category.name}</span>
                                                        {procurement.vendor ? (
                                                            <span className="text-sm text-gray-500">{procurement.vendor.name}</span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">Tanpa Vendor</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {procurement.user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge
                                                        status={procurement.status}
                                                        label={procurement.status_label}
                                                        color={procurement.status_color}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                    Rp {Number(procurement.total_amount).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('procurements.show', procurement.id)}
                                                        className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-900 font-semibold bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" /> Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {procurements.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-surface-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-sm text-gray-500 font-medium">
                                    Menampilkan {procurements.data.length} dari {procurements.total} data
                                </span>
                                <div className="flex space-x-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                                    {procurements.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${link.active ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </AuthenticatedLayout>
    );
}
