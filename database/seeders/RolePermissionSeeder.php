<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'procurement.create',
            'procurement.view',
            'procurement.send',
            'procurement.approve',
            'procurement.reject',
            'procurement.finalize',
            'procurement.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $requester = Role::firstOrCreate(['name' => 'requester']);
        $requester->syncPermissions([
            'procurement.create',
            'procurement.view',
            'procurement.send',
        ]);

        $finance = Role::firstOrCreate(['name' => 'finance']);
        $finance->syncPermissions([
            'procurement.view',
            'procurement.approve',
            'procurement.reject',
        ]);

        $admin = Role::firstOrCreate(['name' => 'admin_procurement']);
        $admin->syncPermissions($permissions); // Admin gets all permissions
    }
}
