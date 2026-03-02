import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Procurement } from '@/types/procurement';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import StatusBadge from '@/Components/StatusBadge';

interface Props extends PageProps {
    procurement: { data: Procurement };
}

export default function Show({ procurement: { data: info } }: Props) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.roles?.[0]?.name || '';

    // Modal states
    const [confirmingApprove, setConfirmingApprove] = useState(false);
    const [confirmingReject, setConfirmingReject] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        notes: '',
    });


    const sendForApproval = () => {
        post(route('procurements.send', info.id));
    };

    const finalize = () => {
        post(route('procurements.finalize', info.id));
    };

    const approve = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('procurements.approve', info.id), {
            onSuccess: () => setConfirmingApprove(false)
        });
    };

    const reject = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('procurements.reject', info.id), {
            onSuccess: () => setConfirmingReject(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Detail Pengadaan: {info.code}
                    </h2>
                    <Link
                        href={route('procurements.index')}
                        className="text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        &larr; Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`Detail Pengadaan - ${info.code}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Header Card */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden border border-gray-200 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{info.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">Diajukan oleh: <span className="font-semibold">{info.user.name}</span> pada {info.created_at}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col items-end">
                                <StatusBadge
                                    status={info.status}
                                    label={info.status_label}
                                    color={info.status_color}
                                />
                                <p className="text-2xl font-black text-indigo-700 mt-2">
                                    Rp {Number(info.total_amount).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Kategori</p>
                                <p className="font-semibold text-gray-900">{info.category.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Vendor</p>
                                <p className="font-semibold text-gray-900">{info.vendor ? info.vendor.name : 'Belum/Tanpa Vendor'}</p>
                            </div>
                        </div>

                        {info.finance_notes && (
                            <div className={`mt-4 p-4 rounded-lg border flex gap-3 ${info.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <div>
                                    <svg className={`h-6 w-6 mt-0.5 ${info.status === 'rejected' ? 'text-red-500' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${info.status === 'rejected' ? 'text-red-800' : 'text-green-800'}`}>
                                        Catatan Finance ({info.status === 'rejected' ? 'Penolakan' : 'Persetujuan'}):
                                    </p>
                                    <p className={`text-sm mt-1 ${info.status === 'rejected' ? 'text-red-700' : 'text-green-700'}`}>
                                        {info.finance_notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Zone */}
                    <div className="flex flex-wrap gap-4">
                        {/* Requester Actions */}
                        {userRole === 'requester' && info.status === 'draft' && (
                            <button
                                onClick={sendForApproval}
                                disabled={processing}
                                className="inline-flex items-center px-6 py-3 bg-yellow-500 border border-transparent rounded-md font-semibold text-white uppercase tracking-widest hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                            >
                                Kirim untuk Persetujuan (Ke Finance)
                            </button>
                        )}

                        {/* Finance Actions */}
                        {userRole === 'finance' && info.status === 'sending' && (
                            <>
                                <button
                                    onClick={() => setConfirmingApprove(true)}
                                    className="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-md font-semibold text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                                >
                                    Approve (Setujui)
                                </button>
                                <button
                                    onClick={() => setConfirmingReject(true)}
                                    className="inline-flex items-center px-6 py-3 bg-red-600 border border-transparent rounded-md font-semibold text-white uppercase tracking-widest hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                                >
                                    Reject (Tolak)
                                </button>
                            </>
                        )}

                        {/* Admin Actions */}
                        {userRole === 'admin_procurement' && info.status === 'approved' && (
                            <button
                                onClick={finalize}
                                disabled={processing}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                            >
                                Proses Pengadaan Selesai
                            </button>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Rincian Item ({info.items?.length || 0})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-white">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Item</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {info.items?.map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">Rp {Number(item.unit_price).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Rp {Number(item.sub_total).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right text-sm text-gray-700 uppercase">Total Keseluruhan:</td>
                                        <td className="px-6 py-4 text-right text-lg text-indigo-700">Rp {Number(info.total_amount).toLocaleString('id-ID')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Approve */}
            <Modal show={confirmingApprove} onClose={() => setConfirmingApprove(false)}>
                <form onSubmit={approve} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Setujui Pengajuan Ini?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Anda dapat memberikan catatan persetujuan untuk user. Opsional.
                    </p>
                    <div className="mt-6">
                        <textarea
                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            rows={3}
                            placeholder="Catatan..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingApprove(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="bg-green-600 hover:bg-green-700" disabled={processing}>Ya, Setujui</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Reject */}
            <Modal show={confirmingReject} onClose={() => setConfirmingReject(false)}>
                <form onSubmit={reject} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Tolak Pengajuan Ini?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Silakan berikan alasan penolakan. <span className="text-red-600 font-bold">Wajib diisi.</span>
                    </p>
                    <div className="mt-6">
                        <textarea
                            className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                            rows={3}
                            placeholder="Alasan penolakan..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            required
                        />
                        <InputError message={errors.notes} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingReject(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="bg-red-600 hover:bg-red-700" disabled={processing}>Ya, Tolak</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
