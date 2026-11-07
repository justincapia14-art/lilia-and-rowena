<div class="auth-page-container">
    <div class="auth-card">
        <span class="auth-kicker">New Customer</span>
        <h1 class="auth-title">Create Your Account</h1>
        <p class="auth-subtitle">Register to order bespoke furniture and receive live updates from our workshop.</p>

        <?php if (!empty($error)): ?>
            <div class="alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form action="index.php?route=do_register" method="POST" class="auth-form" id="registerForm">
            <div class="form-group">
                <label for="regFullName">Full Name *</label>
                <input type="text" id="regFullName" name="full_name" required placeholder="e.g. Maria Santos">
            </div>

            <div class="form-group">
                <label for="regEmail">Email Address *</label>
                <input type="email" id="regEmail" name="email" required placeholder="e.g. maria@example.com">
            </div>

            <div class="form-group">
                <label for="regPassword">Password *</label>
                <input type="password" id="regPassword" name="password" required placeholder="Create a secure password">
            </div>

            <div class="form-group">
                <label for="regPhone">Mobile Number *</label>
                <input type="tel" id="regPhone" name="phone_number" required placeholder="0917-123-4567">
            </div>

            <div class="form-group">
                <label for="regAddress">Home / Delivery Address *</label>
                <textarea id="regAddress" name="address" rows="2" required placeholder="Unit #, Street, Barangay, City"></textarea>
            </div>

            <button type="submit" class="btn-primary btn-large btn-block">Create Account</button>
        </form>

        <div class="auth-switch">
            <span>Already have an account?</span>
            <a href="index.php?route=login">Sign in here →</a>
        </div>
    </div>
</div>
