import { AdminForgotPasswordFlow } from '@/components/auth/AdminForgotPasswordFlow';

/**
 * Sibling of /admin/login (both children of (admin)/admin/layout.tsx, which mounts
 * AdminAuthInitializer but applies NO auth guard) — deliberately NOT under the (protected)
 * route group, for the exact same reason /admin/login isn't: RequireAdminAuth must never wrap
 * a page an unauthenticated admin is supposed to land on, or it immediately redirects back to
 * itself. See RequireAdminAuth.tsx's comment for the full redirect-loop rationale.
 */
export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Reset Admin Password</h1>
          <p className="mt-1 text-sm text-neutral-500">Verify your identity to set a new password</p>
        </div>
        <AdminForgotPasswordFlow />
      </div>
    </div>
  );
}