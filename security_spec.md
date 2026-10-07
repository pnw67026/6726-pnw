# Security Specification & Test Matrix for PNW26 Expense Tracker

## 1. Data Invariants

1. **User Scoping & Isolation**: All transactions and budgets reside under `/users/{userId}/...`. A user with UID `X` can NEVER read, create, update, or delete records in `/users/{Y}/...`.
2. **Identity Integrity**: For any transaction write under `/users/{userId}/transactions/{transactionId}`, `incoming().userId` MUST strictly equal `request.auth.uid`, and `request.auth.uid` MUST equal `userId`.
3. **Type & Value Boundaries**:
   - `amount` must be a positive number (`amount > 0`).
   - `type` must strictly be either `'income'` or `'expense'`.
   - `title` must be a string between 1 and 100 characters.
   - `category` must be a string between 1 and 50 characters.
   - `date` must match the pattern `^\d{4}-\d{2}-\d{2}$`.
   - `note` (if present) must not exceed 500 characters.
   - `paymentMethod` (if present) must not exceed 50 characters.
4. **Path Variable Hardening**: `isValidId(userId)` and `isValidId(transactionId)` must be enforced to guard against injection.
5. **Budget Integrity**:
   - `monthYear` must match pattern `^\d{4}-\d{2}$`.
   - `totalBudget` must be a non-negative number (`>= 0`).
6. **No Unauthenticated Access**: Unauthenticated requests (`request.auth == null`) are rejected everywhere.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Cases)

1. **Dirty Payload 1 (Identity Hijack)**: User A (`uid_attacker`) tries to write into `/users/uid_victim/transactions/tx_1`.
2. **Dirty Payload 2 (Owner Spoofing in Body)**: User A writes to `/users/uid_attacker/transactions/tx_1` but sends `userId: "uid_victim"`.
3. **Dirty Payload 3 (Negative Amount Exploitation)**: User writes transaction with `amount: -500`.
4. **Dirty Payload 4 (Zero Amount Exploitation)**: User writes transaction with `amount: 0`.
5. **Dirty Payload 5 (Invalid Type Injection)**: User sends `type: "transfer_hack"` or `type: "refund"`.
6. **Dirty Payload 6 (Buffer Overflow Title)**: User sends a title string exceeding 100 characters.
7. **Dirty Payload 7 (Malformed Date Format)**: User sends `date: "not-a-date"` or SQL injection payload in date.
8. **Dirty Payload 8 (Ghost Field / Shadow Field Injection)**: User injects `{ isAdmin: true, bypassLimit: true }` into the transaction.
9. **Dirty Payload 9 (Anonymous / Unauthenticated Read)**: Unauthenticated visitor attempts to `list` or `get` `/users/uid_victim/transactions`.
10. **Dirty Payload 10 (Foreign User List Scraping)**: Authenticated User A tries to list `/users/uid_victim/transactions`.
11. **Dirty Payload 11 (Oversized Note DOS)**: User submits note exceeding 500 characters.
12. **Dirty Payload 12 (Path Poisoning Attack)**: Attacker attempts write to invalid path ID containing special characters `/users/user/transactions/../../hack`.

---

## 3. Test Runner Design

All 12 attacks are asserted to return `PERMISSION_DENIED` under rules validation.
