import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { DashboardStats, Procurement } from '@/types/procurement';
import { Head, Link } from '@inertiajs/react';
import { FileText, Clock, Send, CheckCircle, XCircle, PackageCheck, ArrowRight } from 'lucide-react';

interface Props extends PageProps {
    stats: DashboardStats;
    recentProcurements: Procurement[];
}

export default function Dashboard({ stats, recentProcurements }: Props) {
    const statCards = [
        { label: 'Total Pengadaan', value: stats.total, color: 'from-brand-600 to-brand-800', icon: <FileText className="w-8 h-8 opacity-50" />, span: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2' },
        { label: 'Draft', value: stats.draft, color: 'from-gray-400 to-gray-600', icon: <Clock className="w-6 h-6 opacity-50" />, span: 'col-span-1' },
        { label: 'Menunggu', value: stats.sending, color: 'from-yellow-400 to-yellow-600', icon: <Send className="w-6 h-6 opacity-50" />, span: 'col-span-1' },
        { label: 'Disetujui', value: stats.approved, color: 'from-green-400 to-green-600', icon: <CheckCircle className="w-6 h-6 opacity-50" />, span: 'col-span-1' },
        { label: 'Ditolak', value: stats.rejected, color: 'from-red-400 to-red-600', icon: <XCircle className="w-6 h-6 opacity-50" />, span: 'col-span-1' },
        { label: 'Selesai', value: stats.completed, color: 'from-blue-400 to-blue-600', icon: <PackageCheck className="w-6 h-6 opacity-50" />, span: 'col-span-1 md:col-span-2 lg:col-span-2' },
    ];

    const getStatusBadgeClass = (color: string) => {
        const baseClasses = 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm';
        const colorMap: Record<string, string> = {
            'gray': 'bg-gray-100/80 text-gray-800 border border-gray-200',
            'yellow': 'bg-yellow-100/80 text-yellow-800 border border-yellow-200',
            'green': 'bg-green-100/80 text-green-800 border border-green-200',
            'red': 'bg-red-100/80 text-red-800 border border-red-200',
            'blue': 'bg-blue-100/80 text-blue-800 border border-blue-200',
        };
        return `${baseClasses} ${colorMap[color] || colorMap['gray']}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold leading-tight text-gray-800 tracking-tight">
                    Dashboard E-Procurement
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 animate-fade-in">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* Bento Grid Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className={`group relative overflow-hidden bg-gradient-to-br ${stat.color} rounded-2xl shadow-md hover:shadow-xl p-6 text-white transform transition-all duration-300 hover:-translate-y-1 ${stat.span}`}
                            >
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white opacity-10 transition-transform group-hover:scale-150 duration-500"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider">{stat.label}</h3>
                                        <p className={`font-bold mt-2 ${stat.span.includes('row-span-2') ? 'text-6xl' : 'text-3xl'}`}>{stat.value}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Procurements Table */}
                    <div className="overflow-hidden bg-white/80 backdrop-blur-xl shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-6 bg-transparent">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-brand-500" />
                                    Pengadaan Terbaru
                                </h3>
                                <Link
                                    href={route('procurements.index')}
                                    className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-semibold transition-colors bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100"
                                >
                                    Lihat Semua <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-surface-50">
                                                Kode / Judul
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-surface-50">
                                                Pemohon
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-surface-50">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-surface-50">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-surface-50">
                                                Total
                                            </th>
                                            <th className="px-6 py-4 bg-surface-50"></th>
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
