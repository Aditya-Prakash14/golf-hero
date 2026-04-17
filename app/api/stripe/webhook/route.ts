import { stripe } from '@/lib/stripe'
import { adminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook error: ${errorMessage}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Log event
  await adminClient.from('subscription_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data as unknown as Record<string, unknown>
  })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const userId = session.metadata.user_id
      const sub: any = await stripe.subscriptions.retrieve(session.subscription)
      const plan = sub.items.data[0].plan.interval === 'year' ? 'yearly' : 'monthly'
      const renewalDate = new Date(sub.current_period_end * 1000).toISOString()

      await adminClient.from('profiles').update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_renewal_date: renewalDate,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      }).eq('id', userId)

      // Log charity contribution
      const { data: profile } = await adminClient
        .from('profiles')
        .select('charity_id, charity_percentage')
        .eq('id', userId)
        .single()

      if (profile?.charity_id) {
        const fee = plan === 'yearly' ? 99.99 : 9.99
        const charityAmount = (fee * profile.charity_percentage) / 100

        await adminClient.from('charity_contributions').insert({
          user_id: userId,
          charity_id: profile.charity_id,
          amount: charityAmount,
          subscription_period: new Date().toISOString().slice(0, 7) + '-01'
        })
      }
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.paused': {
      const sub = event.data.object as any
      await adminClient.from('profiles')
        .update({ subscription_status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any
      if (invoice.subscription) {
        const sub: any = await stripe.subscriptions.retrieve(invoice.subscription)
        await adminClient.from('profiles')
          .update({
            subscription_status: 'active',
            subscription_renewal_date: new Date(sub.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', invoice.subscription)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any
      if (invoice.subscription) {
        await adminClient.from('profiles')
          .update({ subscription_status: 'lapsed' })
          .eq('stripe_subscription_id', invoice.subscription)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
