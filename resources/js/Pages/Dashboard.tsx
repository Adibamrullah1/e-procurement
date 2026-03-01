import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { DashboardStats, Procurement } from '@/types/procurement';
import { Head, Link } from '@inertiajs/react';

interface Props extends PageProps {
    stats: DashboardStats;
    recentProcurements: Procurement[];
}

export default function Dashboard({ stats, recentProcurements }: Props) {
    const statCards = [
        { label: 'Total Pengadaan', value: stats.total, color: 'from-gray-500 to-gray-600' },
        { label: 'Draft', value: stats.draft, color: 'from-gray-400 to-gray-500' },
        { label: 'Menunggu', value: stats.sending, color: 'from-yellow-400 to-yellow-500' },
        { label: 'Disetujui', value: stats.approved, color: 'from-green-400 to-green-500' },
        { label: 'Ditolak', value: stats.rejected, color: 'from-red-400 to-red-500' },
        { label: 'Selesai', value: stats.completed, color: 'from-blue-400 to-blue-500' },
    ];

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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard E-Procurement
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className={`bg-gradient-to-r ${stat.color} rounded-xl shadow-lg p-6 text-white transform transition duration-300 hover:scale-105`}
                            >
                                <h3 className="text-lg font-medium opacity-90">{stat.label}</h3>
                                <p className="text-4xl font-bold mt-2">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Procurements Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Pengadaan Terbaru
                                </h3>
                                <Link
                                    href={route('procurements.index')}
                                    className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                    Lihat Semua &rarr;
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Kode / Judul
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pemohon
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentProcurements.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Belum ada data pengadaan.
                                                </td>
                                            </tr>
                                        ) : recentProcurements.map((procurement) => (
                                            <tr key={procurement.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{procurement.code}</span>
                                                        <span className="text-sm text-gray-500">{procurement.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{procurement.user_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {procurement.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={getStatusBadgeClass(procurement.status_color)}>
                                                        {procurement.status_label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    Rp {Number(procurement.total_amount).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('procurements.show', procurement.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
