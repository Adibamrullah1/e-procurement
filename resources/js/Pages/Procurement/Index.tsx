import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Procurement } from '@/types/procurement';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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

    const getStatusBadgeClass = (color: string) => {
        const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        const colorMap: Record<string, string> = {
            'gray': 'bg-gray-100 text-gray-800',
            'yellow': 'bg-yellow-100 text-yellow-800',
            'green': 'bg-green-100 text-green-800',
            'red': 'bg-red-100 text-red-800',
            'blue': 'bg-blue-100 text-blue-800',
        };
        return `${baseClasses} ${colorMap[color] || colorMap['gray']}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Daftar Pengadaan
                    </h2>
                    <Link
                        href={route('procurements.create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow transition duration-150 ease-in-out"
                    >
                        + Buat Pengadaan
                    </Link>
                </div>
            }
        >
            <Head title="Daftar Pengadaan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Filters Context */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="w-full sm:w-1/3">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari kode atau judul..."
                                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="w-full sm:w-auto flex space-x-2 overflow-x-auto pb-1">
                            <button
                                onClick={() => handleStatusFilter('')}
                                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${status === '' ? 'bg-indigo-100 text-indigo-800' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                Semua
                            </button>
                            {statuses.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => handleStatusFilter(s.value)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${status === s.value ? `bg-${s.color}-100 text-${s.color}-800 border-none` : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kode / Judul
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategori / Vendor
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pemohon
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Biaya
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Aksi</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {procurements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pengadaan</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Belum ada data atau tidak ada yang cocok dengan pencarian.
                                                </p>
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
                                                    <span className={getStatusBadgeClass(procurement.status_color)}>
                                                        {procurement.status_label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                    Rp {Number(procurement.total_amount).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('procurements.show', procurement.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                                    >
                                                        Detail &rarr;
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
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                    Menampilkan {procurements.data.length} dari {procurements.total} data
                                </span>
                                <div className="flex space-x-1 border rounded-md overflow-hidden bg-white">
                                    {procurements.links.map((link, i) => (
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
        </AuthenticatedLayout>
    );
}
