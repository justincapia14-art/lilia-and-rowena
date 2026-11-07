<?php require __DIR__ . '/layouts/header.php'; ?>

<section class="section" style="padding-top: 2rem; min-height: 75vh;">
    <div style="max-width: 1180px; margin: 0 auto;">
        <?php if (!empty($success)): ?>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 0.9rem 1.25rem; border-radius: 10px; margin-bottom: 1.25rem; font-weight: 600;">
                ✓ <?= htmlspecialchars($success) ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($error)): ?>
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 0.9rem 1.25rem; border-radius: 10px; margin-bottom: 1.25rem; font-weight: 600;">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <div class="customer-account-shell" style="display: grid; grid-template-columns: 270px 1fr; gap: 1.5rem; align-items: start;">
            <!-- Left Account Sidebar (Shopee-Inspired Navigation) -->
            <aside style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.35rem; box-shadow: 0 6px 20px rgba(12, 30, 53, 0.05);">
                <div style="display: flex; align-items: center; gap: 0.85rem; padding-bottom: 1.1rem; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <div style="width: 52px; height: 52px; border-radius: 50%; background: #e0f2fe; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0369a1; overflow: hidden; flex-shrink: 0;">
                        <?php if (!empty($customer['ProfileImage'])): ?>
                            <img src="<?= htmlspecialchars((string)$customer['ProfileImage']) ?>" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                        <?php else: ?>
                            <?= htmlspecialchars(strtoupper(substr((string)$customer['FullName'], 0, 1))) ?>
                        <?php endif; ?>
                    </div>
                    <div style="min-width: 0;">
                        <div style="font-weight: 700; color: #0f172a; font-size: 0.98rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            <?= htmlspecialchars((string)$customer['FullName']) ?>
                        </div>
                        <a href="index.php?route=profile&amp;tab=profile&amp;edit=1" style="font-size: 0.8rem; color: #0284c7; text-decoration: none; font-weight: 600;">
                            ✎ Edit Profile
                        </a>
                    </div>
                </div>

                <nav style="display: flex; flex-direction: column; gap: 0.35rem;">
                    <a href="index.php?route=profile&amp;tab=profile"
                       style="display: flex; align-items: center; gap: 0.65rem; padding: 0.7rem 0.9rem; border-radius: 9px; text-decoration: none; font-weight: 600; font-size: 0.92rem; <?= $activeTab === 'profile' ? 'background: #e0f2fe; color: #0369a1;' : 'color: #0f172a;' ?>">
                        <span>My Profile</span>
                    </a>
                    <a href="index.php?route=profile&amp;tab=addresses"
                       style="display: flex; align-items: center; gap: 0.65rem; padding: 0.7rem 0.9rem; border-radius: 9px; text-decoration: none; font-weight: 600; font-size: 0.92rem; <?= $activeTab === 'addresses' ? 'background: #e0f2fe; color: #0369a1;' : 'color: #0f172a;' ?>">
                        <span>My Addresses</span>
                    </a>
                    <a href="index.php?route=profile&amp;tab=orders"
                       style="display: flex; align-items: center; gap: 0.65rem; padding: 0.7rem 0.9rem; border-radius: 9px; text-decoration: none; font-weight: 600; font-size: 0.92rem; <?= $activeTab === 'orders' ? 'background: #e0f2fe; color: #0369a1;' : 'color: #0f172a;' ?>">
                        <span>My Orders</span>
                    </a>
                    <a href="index.php?route=messages"
                       style="display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0.9rem; border-radius: 9px; text-decoration: none; font-weight: 600; font-size: 0.92rem; color: #0f172a;">
                        <span style="display: flex; align-items: center; gap: 0.65rem;"><span>Messages</span></span>
                        <?php if (!empty($unreadCount) && (int)$unreadCount > 0): ?>
                            <span class="unread-red-badge"><?= (int)$unreadCount ?></span>
                        <?php endif; ?>
                    </a>
                    <a href="index.php?route=profile&amp;tab=password"
                       style="display: flex; align-items: center; gap: 0.65rem; padding: 0.7rem 0.9rem; border-radius: 9px; text-decoration: none; font-weight: 600; font-size: 0.92rem; <?= $activeTab === 'password' ? 'background: #e0f2fe; color: #0369a1;' : 'color: #0f172a;' ?>">
                        <span>Change Password</span>
                    </a>
                    <a href="index.php?route=logout"
                       style="display: flex; align-items: center; gap: 0.65rem; padding: 0.7rem 0.9rem; border-radius: 9px; text-decoration: none; font-weight: 600; font-size: 0.92rem; color: #b91c1c; margin-top: 0.35rem; border-top: 1px solid #e2e8f0; padding-top: 0.85rem;">
                        <span>Logout</span>
                    </a>
                </nav>
            </aside>

            <!-- Right Content Area -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.85rem; box-shadow: 0 6px 20px rgba(12, 30, 53, 0.05);">

                <?php if ($activeTab === 'profile'): ?>
                    <?php $isEditing = isset($_GET['edit']) && $_GET['edit'] === '1'; ?>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.45rem; color: #0f172a;">My Profile</h2>
                            <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem;">Manage and protect your Lilia &amp; Rowena Furniture account information.</p>
                        </div>
                        <?php if (!$isEditing): ?>
                            <a href="index.php?route=profile&amp;tab=profile&amp;edit=1" class="btn-primary" style="text-decoration: none; padding: 0.6rem 1.2rem; font-size: 0.9rem;">
                                ✎ Edit Profile
                            </a>
                        <?php endif; ?>
                    </div>

                    <form method="POST" action="index.php?route=profile_update" enctype="multipart/form-data">
                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                        <div style="display: grid; grid-template-columns: 1fr 220px; gap: 2rem; align-items: start;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem;">
                                <div>
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Full Name *</label>
                                    <input type="text" name="full_name" required value="<?= htmlspecialchars((string)$customer['FullName']) ?>" <?= !$isEditing ? 'readonly style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Username</label>
                                    <input type="text" name="username" value="<?= htmlspecialchars((string)($customer['Username'] ?? '')) ?>" placeholder="e.g. maria.santos" <?= !$isEditing ? 'readonly style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Email Address *</label>
                                    <input type="email" name="email" required value="<?= htmlspecialchars((string)$customer['Email']) ?>" <?= !$isEditing ? 'readonly style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Mobile Number *</label>
                                    <input type="text" name="phone_number" required value="<?= htmlspecialchars((string)$customer['PhoneNumber']) ?>" <?= !$isEditing ? 'readonly style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Gender (Optional)</label>
                                    <select name="gender" <?= !$isEditing ? 'disabled style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>>
                                        <?php
                                        $currentGender = (string)($customer['Gender'] ?? 'Prefer not to say');
                                        foreach (['Female', 'Male', 'Other', 'Prefer not to say'] as $gOpt):
                                        ?>
                                            <option value="<?= htmlspecialchars($gOpt) ?>" <?= $currentGender === $gOpt ? 'selected' : '' ?>><?= htmlspecialchars($gOpt) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <?php if (!$isEditing): ?>
                                        <input type="hidden" name="gender" value="<?= htmlspecialchars($currentGender) ?>">
                                    <?php endif; ?>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Birthday (Optional)</label>
                                    <input type="date" name="birthday" value="<?= htmlspecialchars((string)($customer['Birthday'] ?? '')) ?>" <?= !$isEditing ? 'readonly style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>>
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Default Delivery Address</label>
                                    <textarea name="default_address" rows="2" <?= !$isEditing ? 'readonly style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;"' : 'style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #38bdf8;"' ?>><?= htmlspecialchars((string)($customer['DefaultAddress'] ?? $customer['Address'] ?? '')) ?></textarea>
                                    <div style="margin-top: 0.35rem; font-size: 0.8rem; color: #64748b;">
                                        Want to manage multiple addresses (Home / Work)? <a href="index.php?route=profile&amp;tab=addresses" style="color: #0284c7; font-weight: 600;">Go to My Addresses →</a>
                                    </div>
                                </div>
                            </div>

                            <!-- Avatar Upload Box -->
                            <div style="border-left: 1px solid #e2e8f0; padding-left: 1.5rem; text-align: center;">
                                <div style="width: 110px; height: 110px; border-radius: 50%; margin: 0 auto 0.85rem; background: #e0f2fe; border: 3px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800; color: #0369a1; overflow: hidden;">
                                    <?php if (!empty($customer['ProfileImage'])): ?>
                                        <img src="<?= htmlspecialchars((string)$customer['ProfileImage']) ?>" alt="Profile Picture" style="width: 100%; height: 100%; object-fit: cover;">
                                    <?php else: ?>
                                        <?= htmlspecialchars(strtoupper(substr((string)$customer['FullName'], 0, 1))) ?>
                                    <?php endif; ?>
                                </div>
                                <?php if ($isEditing): ?>
                                    <label style="display: inline-block; padding: 0.5rem 0.95rem; background: #e0f2fe; color: #0369a1; border: 1px solid #38bdf8; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                                        Select Image
                                        <input type="file" name="profile_image" accept="image/jpeg,image/png,image/webp" style="display: none;">
                                    </label>
                                <?php endif; ?>
                                <p style="font-size: 0.76rem; color: #64748b; margin-top: 0.6rem; line-height: 1.4;">
                                    Max file size: 2 MB<br>Formats: .JPEG, .PNG, .WEBP
                                </p>
                            </div>
                        </div>

                        <?php if ($isEditing): ?>
                            <div style="margin-top: 1.5rem; padding-top: 1.15rem; border-top: 1px solid #e2e8f0; display: flex; gap: 0.75rem;">
                                <button type="submit" class="btn-primary">Save Changes</button>
                                <a href="index.php?route=profile&amp;tab=profile" class="btn-secondary" style="text-decoration: none;">Cancel</a>
                            </div>
                        <?php endif; ?>
                    </form>

                <?php elseif ($activeTab === 'addresses'): ?>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.45rem; color: #0f172a;">My Addresses</h2>
                            <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem;">Manage your saved furniture delivery addresses for fast checkout.</p>
                        </div>
                    </div>

                    <!-- Saved Address Cards -->
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                        <?php foreach ($addresses as $addr): ?>
                            <div style="border: 1.5px solid <?= (int)$addr['IsDefault'] === 1 ? '#0284c7' : '#e2e8f0' ?>; background: <?= (int)$addr['IsDefault'] === 1 ? '#f5faff' : '#ffffff' ?>; border-radius: 12px; padding: 1.15rem 1.35rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
                                        <strong style="font-size: 1rem; color: #0f172a;"><?= htmlspecialchars((string)$addr['RecipientName']) ?></strong>
                                        <span style="color: #64748b;">|</span>
                                        <span style="color: #64748b; font-size: 0.9rem;"><?= htmlspecialchars((string)$addr['PhoneNumber']) ?></span>
                                        <span style="font-size: 0.74rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 999px; background: #e0f2fe; color: #0369a1;">
                                            <?= htmlspecialchars((string)$addr['AddressLabel']) ?>
                                        </span>
                                        <?php if ((int)$addr['IsDefault'] === 1): ?>
                                            <span style="font-size: 0.74rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 999px; background: #dcfce7; color: #166534; border: 1px solid #86efac;">
                                                Default
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                    <div style="font-size: 0.9rem; color: #0f172a; line-height: 1.45;">
                                        <?= htmlspecialchars((string)$addr['HouseStreet']) ?>, Brgy. <?= htmlspecialchars((string)$addr['Barangay']) ?>, <?= htmlspecialchars((string)$addr['City']) ?>, <?= htmlspecialchars((string)$addr['Province']) ?> <?= htmlspecialchars((string)$addr['PostalCode']) ?>
                                    </div>
                                    <?php if (!empty($addr['DeliveryNotes'])): ?>
                                        <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">
                                            Note: <?= htmlspecialchars((string)$addr['DeliveryNotes']) ?>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.45rem; flex-shrink: 0;">
                                    <div style="display: flex; gap: 0.65rem;">
                                        <a href="index.php?route=profile&amp;tab=addresses&amp;edit_address_id=<?= (int)$addr['AddressID'] ?>#addressFormSection" style="font-size: 0.84rem; color: #0284c7; font-weight: 700; text-decoration: none;">Edit</a>
                                        <form method="POST" action="index.php?route=address_delete" style="display: inline;">
                                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                                            <input type="hidden" name="address_id" value="<?= (int)$addr['AddressID'] ?>">
                                            <button type="submit" style="background: none; border: none; color: #b91c1c; font-size: 0.84rem; font-weight: 700; cursor: pointer; padding: 0;">Delete</button>
                                        </form>
                                    </div>
                                    <?php if ((int)$addr['IsDefault'] !== 1): ?>
                                        <form method="POST" action="index.php?route=address_set_default">
                                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                                            <input type="hidden" name="address_id" value="<?= (int)$addr['AddressID'] ?>">
                                            <button type="submit" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 7px; padding: 0.32rem 0.7rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; color: #0f172a;">
                                                Set as Default
                                            </button>
                                        </form>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- Add / Edit Address Form -->
                    <div id="addressFormSection" style="background: #f8fbff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.35rem;">
                        <h3 style="margin: 0 0 1rem; font-size: 1.1rem; color: #0f172a;">
                            <?= $editAddress ? '✎ Edit Delivery Address' : '+ Add New Delivery Address' ?>
                        </h3>
                        <form method="POST" action="index.php?route=address_save">
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                            <?php if ($editAddress): ?>
                                <input type="hidden" name="address_id" value="<?= (int)$editAddress['AddressID'] ?>">
                            <?php endif; ?>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.95rem;">
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Recipient Full Name *</label>
                                    <input type="text" name="recipient_name" required value="<?= htmlspecialchars((string)($editAddress['RecipientName'] ?? $customer['FullName'])) ?>" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Contact Number *</label>
                                    <input type="text" name="phone_number" required value="<?= htmlspecialchars((string)($editAddress['PhoneNumber'] ?? $customer['PhoneNumber'])) ?>" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div style="grid-column: 1 / -1;">
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">House Number / Street / Subdivision *</label>
                                    <input type="text" name="house_street" required value="<?= htmlspecialchars((string)($editAddress['HouseStreet'] ?? '')) ?>" placeholder="Unit / Lot / Block / Street Name" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Barangay *</label>
                                    <input type="text" name="barangay" required value="<?= htmlspecialchars((string)($editAddress['Barangay'] ?? '')) ?>" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">City / Municipality *</label>
                                    <input type="text" name="city" required value="<?= htmlspecialchars((string)($editAddress['City'] ?? '')) ?>" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Province / Region *</label>
                                    <input type="text" name="province" required value="<?= htmlspecialchars((string)($editAddress['Province'] ?? 'Metro Manila')) ?>" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Postal Code *</label>
                                    <input type="text" name="postal_code" required value="<?= htmlspecialchars((string)($editAddress['PostalCode'] ?? '')) ?>" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Address Label</label>
                                    <select name="address_label" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                        <?php $curLabel = (string)($editAddress['AddressLabel'] ?? 'Home'); ?>
                                        <option value="Home" <?= $curLabel === 'Home' ? 'selected' : '' ?>>Home</option>
                                        <option value="Work" <?= $curLabel === 'Work' ? 'selected' : '' ?>>Work</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display:block;font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;">Additional Delivery Instructions (Optional)</label>
                                    <input type="text" name="delivery_notes" value="<?= htmlspecialchars((string)($editAddress['DeliveryNotes'] ?? '')) ?>" placeholder="Gate code, landmark, elevator access" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;">
                                </div>
                                <div style="grid-column: 1 / -1; display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="isDefaultCheckbox" name="is_default" value="1" <?= (!empty($editAddress['IsDefault']) || empty($addresses)) ? 'checked' : '' ?>>
                                    <label for="isDefaultCheckbox" style="font-size: 0.88rem; color: #0f172a; font-weight: 600;">Set as Default Delivery Address</label>
                                </div>
                            </div>
                            <div style="margin-top: 1.1rem; display: flex; gap: 0.75rem;">
                                <button type="submit" class="btn-primary"><?= $editAddress ? 'Update Address' : 'Save Address' ?></button>
                                <?php if ($editAddress): ?>
                                    <a href="index.php?route=profile&amp;tab=addresses" class="btn-secondary" style="text-decoration: none;">Cancel Edit</a>
                                <?php endif; ?>
                            </div>
                        </form>
                    </div>

                <?php elseif ($activeTab === 'orders'): ?>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.45rem; color: #0f172a;">My Orders</h2>
                            <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem;">Track your handcrafted furniture orders and workshop progress.</p>
                        </div>
                    </div>

                    <?php if (empty($orders)): ?>
                        <div style="text-align: center; padding: 2.5rem; color: #64748b;">
                            You have no furniture orders yet. <a href="index.php?route=catalog" style="color: #0284c7; font-weight: 700;">Browse Catalog →</a>
                        </div>
                    <?php else: ?>
                        <div style="display: flex; flex-direction: column; gap: 0.9rem;">
                            <?php foreach ($orders as $ord): ?>
                                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.1rem 1.3rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                                    <div>
                                        <div style="font-weight: 800; color: #0f172a;">Order #<?= (int)$ord['OrderID'] ?> · <?= htmlspecialchars((string)($ord['Status'] ?? 'Pending')) ?></div>
                                        <div style="font-size: 0.84rem; color: #64748b; margin-top: 0.2rem;">
                                            Placed: <?= htmlspecialchars((string)$ord['OrderDate']) ?> · Due: <?= htmlspecialchars((string)$ord['DueDate']) ?>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                                        <strong style="font-size: 1.05rem; color: #0369a1;">₱<?= number_format((float)($ord['TotalAmount'] ?? 0), 2) ?></strong>
                                        <a href="index.php?route=track&amp;order_id=<?= (int)$ord['OrderID'] ?>" class="btn-secondary" style="text-decoration: none; font-size: 0.82rem; padding: 0.45rem 0.85rem;">View Progress</a>
                                        <a href="index.php?route=messages" class="btn-primary" style="text-decoration: none; font-size: 0.82rem; padding: 0.45rem 0.85rem;">Message Workshop</a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                <?php elseif ($activeTab === 'password'): ?>
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <h2 style="margin: 0; font-size: 1.45rem; color: #0f172a;">Change Password</h2>
                        <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem;">For your account's security, please verify your current password before setting a new one.</p>
                    </div>

                    <form method="POST" action="index.php?route=profile_password" style="max-width: 480px; display: flex; flex-direction: column; gap: 1rem;">
                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                        <div>
                            <label style="display:block;font-size:0.82rem;font-weight:700;color:#475569;margin-bottom:0.35rem;">Current Password *</label>
                            <input type="password" name="current_password" required style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block;font-size:0.82rem;font-weight:700;color:#475569;margin-bottom:0.35rem;">New Password (min. 6 characters) *</label>
                            <input type="password" name="new_password" required minlength="6" style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block;font-size:0.82rem;font-weight:700;color:#475569;margin-bottom:0.35rem;">Confirm New Password *</label>
                            <input type="password" name="confirm_password" required minlength="6" style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <button type="submit" class="btn-primary">Update Password</button>
                        </div>
                    </form>
                <?php endif; ?>

            </div>
        </div>
    </div>
</section>

<?php require __DIR__ . '/layouts/footer.php'; ?>
