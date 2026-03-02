<?php

use App\Enums\ProcurementStatus;
use App\Models\Category;
use App\Models\Procurement;
use App\Models\User;
use App\Services\ProcurementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('it creates a new procurement request with items', function () {
    $service = app(ProcurementService::class);
    $category = Category::factory()->create();
    $requester = User::factory()->create();

    $data = [
        'title' => 'Pembelian Laptop Karyawan',
        'category_id' => $category->id,
        'vendor_id' => null,
        'items' => [
            ['item_name' => 'Macbook Pro M3', 'quantity' => 2, 'unit_price' => 25000000],
            ['item_name' => 'Magic Mouse', 'quantity' => 2, 'unit_price' => 1500000],
        ]
    ];

    $procurement = $service->createRequest($data, $requester->id);

    expect($procurement)->toBeInstanceOf(Procurement::class);
    expect($procurement->title)->toBe('Pembelian Laptop Karyawan');
    expect($procurement->status)->toBe(ProcurementStatus::DRAFT);
    expect($procurement->user_id)->toBe($requester->id);
    expect($procurement->total_amount)->toBe((float) (2 * 25000000 + 2 * 1500000));

    expect($procurement->items)->toHaveCount(2);
});

test('it successfully approves a pending procurement', function () {
    $service = app(ProcurementService::class);
    $requester = User::factory()->create();

    // Scaffold procurement and set status to SENDING (Pending Approval)
    $procurement = Procurement::factory()->create([
        'user_id' => $requester->id,
        'status' => ProcurementStatus::SENDING
    ]);

    $updatedProcurement = $service->handleApproval($procurement->id, 'approve', 'Disetujui. Sesuai budget.');

    expect($updatedProcurement->status)->toBe(ProcurementStatus::APPROVED);
    expect($updatedProcurement->finance_notes)->toBe('Disetujui. Sesuai budget.');
});

test('it fails rejection if notes are empty', function () {
    $service = app(ProcurementService::class);
    $requester = User::factory()->create();

    $procurement = Procurement::factory()->create([
        'user_id' => $requester->id,
        'status' => ProcurementStatus::SENDING
    ]);

    expect(fn() => $service->handleApproval($procurement->id, 'reject', null))
        ->toThrow(ValidationException::class);
});

test('it successfully rejects a pending procurement', function () {
    $service = app(ProcurementService::class);
    $requester = User::factory()->create();

    $procurement = Procurement::factory()->create([
        'user_id' => $requester->id,
        'status' => ProcurementStatus::SENDING
    ]);

    $updatedProcurement = $service->handleApproval($procurement->id, 'reject', 'Budget IT sudah habis.');

    expect($updatedProcurement->status)->toBe(ProcurementStatus::REJECTED);
    expect($updatedProcurement->finance_notes)->toBe('Budget IT sudah habis.');
});
