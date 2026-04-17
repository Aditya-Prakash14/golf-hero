import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Welcome to Golf Heroes! 🏌️',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h1 style="color: #34d399; margin-bottom: 16px;">Welcome, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.6;">Your Golf Heroes subscription is now active. Here's what you can do:</p>
          <ul style="font-size: 15px; line-height: 2;">
            <li>🏌️ Enter your latest golf scores</li>
            <li>🎯 Participate in monthly draws</li>
            <li>💚 Support your chosen charity</li>
            <li>🏆 Win prizes every month</li>
          </ul>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">Go to Dashboard →</a>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendDrawResultEmail(
  email: string,
  name: string,
  matchCount: number,
  prize: number | null
) {
  const won = prize && prize > 0
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: won ? '🎉 You won this month\'s draw!' : 'This month\'s draw results',
      html: won
        ? `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h1 style="color: #fbbf24;">🎉 Congratulations, ${name}!</h1>
            <p style="font-size: 18px;">You matched <strong>${matchCount}</strong> numbers and won <strong>₹${prize.toLocaleString('en-IN')}</strong>!</p>
            <p>Please upload your proof of scores to claim your winnings.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">Claim Winnings →</a>
          </div>
        `
        : `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h1 style="color: #34d399;">Draw Results</h1>
            <p style="font-size: 16px;">Hi ${name}, you matched <strong>${matchCount}</strong> numbers this month.</p>
            <p>Better luck next draw! Keep entering your scores for more chances to win.</p>
          </div>
        `,
    })
  } catch (error) {
    console.error('Failed to send draw result email:', error)
  }
}

export async function sendWinnerVerificationEmail(email: string, status: 'approved' | 'rejected') {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: status === 'approved' ? '✅ Your winnings have been approved!' : 'Verification update',
      html: status === 'approved'
        ? `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h1 style="color: #34d399;">✅ Approved!</h1>
            <p>Your proof has been verified and your payout is being processed.</p>
          </div>
        `
        : `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
            <h1 style="color: #ef4444;">Verification Update</h1>
            <p>Your proof submission was not approved. Please contact support for more information.</p>
          </div>
        `,
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}
