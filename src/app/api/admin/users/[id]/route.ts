import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

import { requireRole } from '@/lib/api/auth';
import prisma from '@/lib/api/db';

const VALID_ROLES = ['superadmin', 'admin', 'fungsio'];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ['superadmin']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { name, email, role, password } = await req.json();

    const targetUser = await prisma.admin.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { status: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    const trimmedEmail = email ? email.trim().toLowerCase() : targetUser.email;
    const trimmedRole = role ? role.trim().toLowerCase() : targetUser.role;

    if (role && !VALID_ROLES.includes(trimmedRole)) {
      return NextResponse.json(
        {
          status: false,
          message: `Role tidak valid. Pilihan role: ${VALID_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Protect last superadmin from demotion
    if (targetUser.role === 'superadmin' && trimmedRole !== 'superadmin') {
      const superadminCount = await prisma.admin.count({
        where: { role: 'superadmin' },
      });
      if (superadminCount <= 1) {
        return NextResponse.json(
          {
            status: false,
            message: 'Tidak dapat mengubah role superadmin terakhir dalam sistem.',
          },
          { status: 400 }
        );
      }
    }

    // Check email uniqueness if email changed
    if (trimmedEmail !== targetUser.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email: trimmedEmail },
      });
      if (emailExists) {
        return NextResponse.json(
          { status: false, message: 'Email sudah digunakan oleh akun lain.' },
          { status: 409 }
        );
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    } = {};

    if (name) updateData.name = name.trim();
    if (email) updateData.email = trimmedEmail;
    if (role) updateData.role = trimmedRole;

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { status: false, message: 'Password minimal 6 karakter' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Pengguna berhasil diperbarui',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { status: false, message: 'Gagal memperbarui pengguna', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ['superadmin']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Prevent deleting own account
    if (auth.adminId === id) {
      return NextResponse.json(
        { status: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.admin.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { status: false, message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Protect last superadmin from deletion
    if (targetUser.role === 'superadmin') {
      const superadminCount = await prisma.admin.count({
        where: { role: 'superadmin' },
      });
      if (superadminCount <= 1) {
        return NextResponse.json(
          {
            status: false,
            message: 'Tidak dapat menghapus superadmin terakhir dalam sistem.',
          },
          { status: 400 }
        );
      }
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({
      status: true,
      message: 'Pengguna berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { status: false, message: 'Gagal menghapus pengguna', error: String(error) },
      { status: 500 }
    );
  }
}
