import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    // Find user with the provided reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }, // Ensure the token is not expired
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired reset token.', status: false }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update the user's password and clear the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    // Get the user's role
    const userRole = user.role || 'customer'; // Assuming there's a role field, fallback to 'customer' if not set

    // Return success message along with the user's role
    return NextResponse.json({
      message: 'Password has been reset successfully.',
      status: true,
      role: userRole, // Include the role in the response
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ message: 'Failed to reset password.', status: false }, { status: 500 });
  }
}
