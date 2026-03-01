import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Category, Vendor } from '@/types/procurement';
import { Head, useForm } from '@inertiajs/react';

interface Props extends PageProps {
    categories: Category[];
    vendors: Vendor[];
}

export default function Create({ categories, vendors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        vendor_id: '',
        items: [{ item_name: '', quantity: 1, unit_price: 0 }],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('procurements.store'));
    };

    const addItem = () => {
        setData('items', [...data.items, { item_name: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Buat Pengadaan Baru
                </h2>
            }
        >
            <Head title="Buat Pengadaan Baru" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Header Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                                    <div className="col-span-1 md:col-span-2">
                                        <InputLabel htmlFor="title" value="Judul Pengadaan" className="font-bold text-gray-700" />
                                        <TextInput
                                            id="title"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            required
                                            isFocused
                                        />
                                        <InputError className="mt-2" message={errors.title} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="category_id" value="Kategori" className="font-bold text-gray-700" />
                                        <select
                                            id="category_id"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Kategori --</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={errors.category_id} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="vendor_id" value="Vendor (Opsional)" className="font-bold text-gray-700" />
                                        <select
                                            id="vendor_id"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.vendor_id}
                                            onChange={(e) => setData('vendor_id', e.target.value)}
                                        >
                                            <option value="">-- Tanpa Vendor --</option>
                                            {vendors.map((v) => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={errors.vendor_id} />
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Daftar Item</h3>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-transparent rounded-md font-semibold text-xs text-indigo-700 uppercase tracking-widest hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            + Tambah Item
                                        </button>
                                    </div>

                                    {/* Array of items error */}
                                    {errors.items && <InputError className="mb-4" message={errors.items} />}

                                    <div className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                                                <div className="w-full md:w-5/12">
                                                    <InputLabel value={`Nama Item ${index + 1}`} />
                                                    <TextInput
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={item.item_name}
                                                        onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                                        required
                                                    />
                                                    {/* @ts-ignore */}
                                                    <InputError className="mt-2" message={errors[`items.${index}.item_name`]} />
                                                </div>

                                                <div className="w-full md:w-2/12">
                                                    <InputLabel value="Jumlah" />
                                                    <TextInput
                                                        type="number"
                                                        min="1"
                                                        className="mt-1 block w-full"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        required
                                                    />
                                                    {/* @ts-ignore */}
                                                    <InputError className="mt-2" message={errors[`items.${index}.quantity`]} />
                                                </div>

                                                <div className="w-full md:w-4/12">
                                                    <InputLabel value="Harga Satuan (Rp)" />
                                                    <TextInput
                                                        type="number"
                                                        min="0"
                                                        className="mt-1 block w-full"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        required
                                                    />
                                                    {/* @ts-ignore */}
                                                    <InputError className="mt-2" message={errors[`items.${index}.unit_price`]} />
                                                </div>

                                                {data.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="absolute -top-3 -right-3 md:relative md:top-0 md:right-0 md:mt-8 md:w-1/12 text-red-500 hover:text-red-700 flex justify-center items-center bg-white md:bg-transparent rounded-full md:rounded-none shadow md:shadow-none p-1 md:p-0"
                                                        title="Hapus Item"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Subtotal Label for this item */}
                                                <div className="w-full text-right md:hidden text-sm font-bold text-gray-700 mt-2">
                                                    Sub Total: Rp {(item.quantity * item.unit_price).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grand Total */}
                                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg flex justify-between items-center border border-indigo-100">
                                        <span className="text-lg font-bold text-indigo-900">Total Estimasi Harga:</span>
                                        <span className="text-2xl font-black text-indigo-700">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                    </div>

                                </div>

                                <div className="flex items-center justify-end mt-8 border-t border-gray-200 pt-6">
                                    <PrimaryButton className="ml-4 px-6 py-3" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Draft Pengadaan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
