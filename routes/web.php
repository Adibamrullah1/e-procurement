<?php

use App\Enums\ProcurementStatus;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProfileController;
use App\Models\Procurement;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();

    // Base query for stats
    $query = Procurement::query();

    // Requester only sees their own stats
    if ($user->hasRole('requester') && !$user->hasRole('admin_procurement')) {
        $query->where('user_id', $user->id);
    }

    $stats = [
        'total' => (clone $query)->count(),
        'draft' => (clone $query)->where('status', ProcurementStatus::DRAFT)->count(),
        'sending' => (clone $query)->where('status', ProcurementStatus::SENDING)->count(),
        'approved' => (clone $query)->where('status', ProcurementStatus::APPROVED)->count(),
        'rejected' => (clone $query)->where('status', ProcurementStatus::REJECTED)->count(),
        'completed' => (clone $query)->where('status', ProcurementStatus::COMPLETED)->count(),
    ];

    $recentProcurements = (clone $query)
        ->with(['user', 'category'])
        ->latest()
        ->take(5)
        ->get()
        ->map(fn($p) => [
            'id' => $p->id,
            'code' => $p->code,
            'title' => $p->title,
            'status' => $p->status->value,
            'status_label' => $p->status->label(),
            'status_color' => $p->status->color(),
            'total_amount' => $p->total_amount,
            'created_at' => $p->created_at->format('d M Y'),
            'user_name' => $p->user->name,
        ]);

    return Inertia::render('Dashboard', [
        'stats' => $stats,
        'recentProcurements' => $recentProcurements,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Procurement routes
    Route::resource('procurements', ProcurementController::class)->only([
        'index',
        'create',
        'store',
        'show',
    ]);

    Route::middleware('permission:procurement.send')->group(function () {
        Route::post('/procurements/{procurement}/send', [ProcurementController::class, 'send'])
            ->name('procurements.send');
    });

    Route::middleware('permission:procurement.approve|procurement.reject')->group(function () {
        Route::post('/procurements/{procurement}/approve', [ProcurementController::class, 'approve'])
            ->name('procurements.approve');
        Route::post('/procurements/{procurement}/reject', [ProcurementController::class, 'reject'])
            ->name('procurements.reject');
    });

    Route::middleware('permission:procurement.finalize')->group(function () {
        Route::post('/procurements/{procurement}/finalize', [ProcurementController::class, 'finalize'])
            ->name('procurements.finalize');
    });
    Route::middleware('permission:admin_procurement')->group(function () {
        Route::resource('categories', \App\Http\Controllers\CategoryController::class)->except(['create', 'show', 'edit']);
        Route::resource('vendors', \App\Http\Controllers\VendorController::class)->except(['create', 'show', 'edit']);
    });
});

require __DIR__ . '/auth.php';

