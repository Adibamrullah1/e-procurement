<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ProcurementStatus;
use App\Models\Category;
use App\Models\Procurement;
use App\Models\ProcurementItem;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo categories
        $categories = [
            Category::firstOrCreate(['name' => 'Alat Tulis Kantor'], ['description' => 'Perlengkapan ATK']),
            Category::firstOrCreate(['name' => 'Perangkat IT'], ['description' => 'Komputer, laptop, printer, dll']),
            Category::firstOrCreate(['name' => 'Furniture'], ['description' => 'Meja, kursi, lemari']),
            Category::firstOrCreate(['name' => 'Jasa Konsultansi'], ['description' => 'Jasa tenaga ahli']),
        ];

        // Create demo vendors
        $vendors = [
            Vendor::firstOrCreate(['name' => 'PT Sumber Makmur'], ['address' => 'Jl. Sudirman No. 10, Jakarta', 'phone' => '021-5551234', 'email' => 'info@sumbermakmur.co.id']),
            Vendor::firstOrCreate(['name' => 'CV Teknologi Nusantara'], ['address' => 'Jl. Gatot Subroto No. 5, Bandung', 'phone' => '022-7771234', 'email' => 'sales@teknusa.co.id']),
            Vendor::firstOrCreate(['name' => 'PT Mebel Indonesia'], ['address' => 'Jl. Ahmad Yani No. 20, Surabaya', 'phone' => '031-8881234', 'email' => 'order@mebelindo.co.id']),
        ];

        // Create demo users with roles
        $requester = User::firstOrCreate(
            ['email' => 'requester@eprocurement.test'],
            ['name' => 'Budi Santoso', 'password' => bcrypt('password')]
        );
        $requester->assignRole('requester');

        $finance = User::firstOrCreate(
            ['email' => 'finance@eprocurement.test'],
            ['name' => 'Siti Rahayu', 'password' => bcrypt('password')]
        );
        $finance->assignRole('finance');

        $admin = User::firstOrCreate(
            ['email' => 'admin@eprocurement.test'],
            ['name' => 'Ahmad Firmansyah', 'password' => bcrypt('password')]
        );
        $admin->assignRole('admin_procurement');

        // Create demo procurements
        $procurements = [
            [
                'user' => $requester,
                'category' => $categories[0],
                'vendor' => $vendors[0],
                'title' => 'Pengadaan ATK Bulanan Maret 2026',
                'status' => ProcurementStatus::DRAFT,
                'items' => [
                    ['item_name' => 'Kertas A4 70gr', 'quantity' => 50, 'unit_price' => 45000],
                    ['item_name' => 'Pulpen Pilot', 'quantity' => 100, 'unit_price' => 5000],
                    ['item_name' => 'Buku Tulis A5', 'quantity' => 30, 'unit_price' => 8000],
                ],
            ],
            [
                'user' => $requester,
                'category' => $categories[1],
                'vendor' => $vendors[1],
                'title' => 'Pengadaan Laptop Staff Baru',
                'status' => ProcurementStatus::SENDING,
                'items' => [
                    ['item_name' => 'Laptop ASUS VivoBook 15', 'quantity' => 5, 'unit_price' => 8500000],
                    ['item_name' => 'Mouse Wireless Logitech', 'quantity' => 5, 'unit_price' => 250000],
                ],
            ],
            [
                'user' => $requester,
                'category' => $categories[2],
                'vendor' => $vendors[2],
                'title' => 'Pengadaan Meja Kerja Divisi HR',
                'status' => ProcurementStatus::APPROVED,
                'finance_notes' => 'Disetujui sesuai kebutuhan.',
                'items' => [
                    ['item_name' => 'Meja Kerja 120x60cm', 'quantity' => 10, 'unit_price' => 1200000],
                    ['item_name' => 'Kursi Ergonomis', 'quantity' => 10, 'unit_price' => 2500000],
                ],
            ],
            [
                'user' => $requester,
                'category' => $categories[1],
                'vendor' => $vendors[1],
                'title' => 'Pengadaan Server Rack',
                'status' => ProcurementStatus::REJECTED,
                'finance_notes' => 'Budget belum tersedia untuk tahun ini. Mohon diajukan kembali tahun depan.',
                'items' => [
                    ['item_name' => 'Server Rack 42U', 'quantity' => 2, 'unit_price' => 15000000],
                ],
            ],
            [
                'user' => $requester,
                'category' => $categories[0],
                'vendor' => $vendors[0],
                'title' => 'Pengadaan ATK Februari 2026',
                'status' => ProcurementStatus::COMPLETED,
                'items' => [
                    ['item_name' => 'Tinta Printer Canon', 'quantity' => 20, 'unit_price' => 75000],
                    ['item_name' => 'Stapler HD-10', 'quantity' => 15, 'unit_price' => 25000],
                ],
            ],
        ];

        foreach ($procurements as $procData) {
            $totalAmount = 0;
            $items = [];

            foreach ($procData['items'] as $item) {
                $subTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $subTotal;
                $items[] = array_merge($item, ['sub_total' => $subTotal]);
            }

            $procurement = Procurement::create([
                'code' => Procurement::generateCode(),
                'user_id' => $procData['user']->id,
                'category_id' => $procData['category']->id,
                'vendor_id' => $procData['vendor']->id,
                'title' => $procData['title'],
                'total_amount' => $totalAmount,
                'status' => $procData['status'],
                'finance_notes' => $procData['finance_notes'] ?? null,
            ]);

            foreach ($items as $item) {
                ProcurementItem::create(array_merge($item, [
                    'procurement_id' => $procurement->id,
                ]));
            }
        }
    }
}
