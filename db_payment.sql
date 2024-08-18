CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel User
CREATE TABLE "User" (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transaction
CREATE TABLE "Transaction" (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    to_address VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Payment Account
CREATE TABLE "PaymentAccount" (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Payment History
CREATE TABLE "PaymentHistory" (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
    account_id UUID REFERENCES "PaymentAccount"(account_id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES "Transaction"(transaction_id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Recurring Payment
CREATE TABLE "RecurringPayment" (
    recurring_payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
    account_id UUID REFERENCES "PaymentAccount"(account_id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    interval VARCHAR(50) NOT NULL,
    next_execution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes (optional, but can improve performance)
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_payment_account_user ON "PaymentAccount"(user_id);
CREATE INDEX idx_payment_history_user ON "PaymentHistory"(user_id);
CREATE INDEX idx_payment_history_account ON "PaymentHistory"(account_id);
CREATE INDEX idx_recurring_payment_user ON "RecurringPayment"(user_id);
CREATE INDEX idx_recurring_payment_account ON "RecurringPayment"(account_id);
