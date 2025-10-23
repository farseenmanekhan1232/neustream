# Razorpay Payment Integration

This document provides comprehensive documentation for the Razorpay payment integration in Neustream.

## Overview

The Razorpay integration enables secure payment processing for subscription plans, allowing users to upgrade from the Free plan to Pro or Business plans.

## Features

- **Secure Payment Processing**: All payments are handled securely through Razorpay
- **Subscription Management**: Automatic subscription updates after successful payments
- **Payment History**: Track user payment history and orders
- **Webhook Support**: Handle payment events via webhooks
- **Error Handling**: Comprehensive error handling for payment failures

## Setup Instructions

### 1. Razorpay Account Setup

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Go to the Razorpay Dashboard → Settings → API Keys
3. Generate new API keys (Key ID and Key Secret)
4. Set up webhooks in Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://api.neustream.app/api/payments/webhook`
   - Subscribe to events: `payment.captured`, `payment.failed`, `subscription.cancelled`

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Razorpay Payment Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

### 3. Database Migration

Run the payment migration to create the necessary tables:

```bash
cd control-plane
node scripts/migrate-payments.js
```

### 4. Test Mode

For testing, use Razorpay's test mode:
- Use test API keys from Razorpay Dashboard
- Test card details:
  - Card Number: `4111 1111 1111 1111`
  - Expiry: Any future date
  - CVV: Any 3 digits
  - Name: Any name

## API Endpoints

### Create Payment Order

**POST** `/api/payments/create-order`

Creates a Razorpay order for subscription payment.

**Request Body:**
```json
{
  "plan_id": 2,
  "billing_cycle": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_XXXXXXXXXXXXXX",
    "amount": 190000,
    "currency": "INR",
    "key": "rzp_test_XXXXXXXXXXXX",
    "name": "Neustream",
    "description": "Pro Subscription",
    "prefill": {
      "name": "",
      "email": ""
    },
    "theme": {
      "color": "#2563eb"
    }
  }
}
```

### Verify Payment

**POST** `/api/payments/verify-payment`

Verifies payment signature and updates subscription.

**Request Body:**
```json
{
  "order_id": "order_XXXXXXXXXXXXXX",
  "payment_id": "pay_XXXXXXXXXXXXXX",
  "signature": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### Get Payment History

**GET** `/api/payments/history`

Returns user's payment history.

### Webhook Endpoint

**POST** `/api/payments/webhook`

Handles Razorpay webhook events.

## Frontend Integration

### Subscription Management Component

The `SubscriptionManagement` component handles the payment flow:

1. **Plan Selection**: User selects a plan to upgrade to
2. **Payment Order Creation**: Creates a Razorpay order
3. **Payment Modal**: Opens Razorpay checkout
4. **Payment Verification**: Verifies payment and updates subscription

### Key Features

- **Free Plan Handling**: Direct subscription updates for free plans
- **Paid Plan Handling**: Razorpay checkout for paid plans
- **Error Handling**: Comprehensive error messages and fallbacks
- **Loading States**: Proper loading indicators during payment processing

## Database Schema

### Payment Orders Table

Stores Razorpay order information:

```sql
CREATE TABLE payment_orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  billing_cycle VARCHAR(10) DEFAULT 'monthly',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'created',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Payments Table

Stores completed payment information:

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  billing_cycle VARCHAR(10) DEFAULT 'monthly',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_id VARCHAR(255) UNIQUE,
  order_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

1. **Signature Verification**: All payments are verified using Razorpay signatures
2. **No Card Storage**: Payment information is never stored on our servers
3. **HTTPS Only**: All payment communication uses HTTPS
4. **Webhook Security**: Webhook signatures are verified
5. **User Authorization**: Users can only access their own payment data

## Error Handling

### Common Errors

- **Invalid Signature**: Payment verification failed
- **Order Not Found**: Order ID doesn't exist
- **Payment Not Captured**: Payment wasn't successful
- **Plan Not Found**: Invalid subscription plan

### Error Responses

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Testing

### Test Cards

Use Razorpay test cards for development:

- **Success**: `4111 1111 1111 1111`
- **Failure**: Any other card number
- **Authentication**: Cards that require 3DS authentication

### Test Webhooks

Use Razorpay's webhook testing tool to simulate payment events.

## Monitoring

### Logs

Payment-related logs include:
- Order creation
- Payment verification
- Webhook events
- Error conditions

### Metrics

Track payment success rates, average transaction values, and subscription upgrades.

## Troubleshooting

### Common Issues

1. **Payment Fails**: Check Razorpay dashboard for error details
2. **Webhook Not Received**: Verify webhook URL and signature
3. **Subscription Not Updated**: Check payment verification logs
4. **Invalid API Keys**: Verify environment variables

### Support

For payment-related issues:
1. Check server logs for detailed error information
2. Verify Razorpay dashboard for transaction status
3. Contact Razorpay support for payment gateway issues

## Future Enhancements

- **Recurring Payments**: Support for automatic subscription renewals
- **Multiple Payment Methods**: Support for UPI, net banking, etc.
- **Refund Processing**: Automated refund handling
- **Invoice Generation**: Automated invoice creation
- **Payment Analytics**: Detailed payment analytics and reporting