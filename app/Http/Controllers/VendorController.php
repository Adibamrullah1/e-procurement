<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(): Response
    {
        $vendors = \Illuminate\Support\Facades\Cache::remember('vendors.all', 60 * 24, function () {
            return Vendor::latest()->get();
        });

        // Paginate manually or just return all since it's Master Data
        // To preserve compatibility with frontend that expects pagination:
        $page = request()->get('page', 1);
        $perPage = 10;
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $vendors->forPage($page, $perPage)->values(),
            $vendors->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        return Inertia::render('Vendor/Index', [
            'vendors' => $paginator
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:vendors,name'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        Vendor::create($validated);

        return back()->with('success', 'Vendor master berhasil ditambahkan.');
    }

    public function update(Request $request, Vendor $vendor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:vendors,name,' . $vendor->id],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        $vendor->update($validated);

        return back()->with('success', 'Vendor master berhasil diperbarui.');
    }

    public function destroy(Vendor $vendor): RedirectResponse
    {
        if ($vendor->procurements()->exists()) {
            return back()->withErrors(['error' => 'Vendor ini tidak dapat dihapus karena paut bertaut dengan data pengadaan.']);
        }

        $vendor->delete();

        return back()->with('success', 'Vendor master berhasil dihapus.');
    }
}
