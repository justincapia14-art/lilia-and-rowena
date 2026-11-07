<div class="section-container" style="max-width: 520px; padding-top: 3rem;">
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.25rem; box-shadow: 0 4px 12px rgba(15,23,42,0.06);">
        <span class="section-kicker">Account Authentication</span>
        <h1 class="section-title" style="font-size: 1.75rem; margin-bottom: 0.35rem;">Customer &amp; Admin Sign In</h1>
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 1.5rem;">
            Sign in with your Customer account to order &amp; track furniture, or use your Admin account to manage workshop operations.
        </p>

        <?php if (!empty($error)): ?>
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.82rem; margin-bottom: 1.25rem;">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form action="index.php?route=do_login" method="POST">
            <div class="form-group">
                <label for="loginRoleSelect">Account Type</label>
                <select id="loginRoleSelect" name="login_role">
                    <option value="auto">Auto-Detect (Customer or Admin)</option>
                    <option value="customer">Customer Account (Table: Customer)</option>
                    <option value="admin">Workshop Admin (Table: Admin)</option>
                </select>
            </div>

            <div class="form-group">
                <label for="loginEmail">Email Address</label>
                <input type="email" id="loginEmail" name="email" required placeholder="name@example.com">
            </div>

            <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" name="password" required placeholder="••••••••">
            </div>

            <button type="submit" class="btn-primary btn-block btn-large" style="margin-top: 0.5rem;">
                Sign In to Account
            </button>
        </form>

        <div style="margin-top: 1.25rem; text-align: center; font-size: 0.84rem; color: #64748b;">
            <span>New Customer?</span>
            <a href="index.php?route=register" style="color: #0284c7; font-weight: 700;">Create a Customer Account →</a>
        </div>

        <div style="margin-top: 1.5rem; padding: 0.9rem; background: #f0f7ff; border: 1px solid #bae6fd; border-radius: 8px; font-size: 0.76rem; color: #334155; line-height: 1.6;">
            <strong style="color: #075985; display: block; margin-bottom: 0.25rem;">Database Accounts (From 02_sample_data.sql):</strong>
            <div>👤 <strong>Customer:</strong> <code>maria.santos@example.com</code> | Pass: <code>password123</code></div>
            <div>🔑 <strong>Admin:</strong> <code>admin@liliaandrowena.com</code> | Pass: <code>admin123</code></div>
        </div>
    </div>
</div>
