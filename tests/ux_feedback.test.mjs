import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

test('UX Confirmation Modal & Toast Notification structure in index.html and views/layouts/footer.php', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const footerPhp = fs.readFileSync(path.join(rootDir, 'views/layouts/footer.php'), 'utf8');

  assert.match(indexHtml, /id="globalToastContainer"/);
  assert.match(indexHtml, /id="uxConfirmModal"/);
  assert.match(indexHtml, /id="uxConfirmTitle"/);
  assert.match(indexHtml, /id="uxConfirmMessage"/);
  assert.match(indexHtml, /id="uxConfirmCancelBtn"/);
  assert.match(indexHtml, /id="uxConfirmActionBtn"/);

  assert.match(footerPhp, /id="globalToastContainer"/);
  assert.match(footerPhp, /id="uxConfirmModal"/);
});

test('Professional Loading States, Confirmation Dialogs, and Success/Error Toasts in public/js/main.js', () => {
  const mainJs = fs.readFileSync(path.join(rootDir, 'public/js/main.js'), 'utf8');

  // 1. Logout Confirmation requirements
  assert.match(mainJs, /title:\s*'Confirm Logout'/);
  assert.match(mainJs, /message:\s*'Are you sure you want to log out of your account\?'/);
  assert.match(mainJs, /cancelText:\s*'Cancel'/);
  assert.match(mainJs, /confirmText:\s*'Yes, Log Out'/);
  assert.match(mainJs, /loadingText:\s*'Logging out\.\.\.'/);
  assert.match(mainJs, /You have been logged out successfully\./);

  // 2. Loading indicator strings
  const requiredLoadingStates = [
    'Logging in...',
    'Creating your account...',
    'Logging out...',
    'Saving changes...',
    'Adding to cart...',
    'Removing item...',
    'Placing your order...',
    'Updating order status...',
    'Sending message...',
    'Uploading profile picture...',
    'Saving delivery address...',
    'Deleting record...'
  ];
  for (const stateText of requiredLoadingStates) {
    assert.ok(mainJs.includes(stateText), `Expected main.js to include loading text "${stateText}"`);
  }

  // 3. Confirmation dialog prompts
  const requiredConfirmPrompts = [
    'Are you sure you want to remove this item from your cart?',
    'Are you sure you want to delete this address?',
    'Please review your order details. Do you want to place this order?',
    'Are you sure you want to cancel this order?',
    'Are you sure you want to update this order status?'
  ];
  for (const promptText of requiredConfirmPrompts) {
    assert.ok(mainJs.includes(promptText), `Expected main.js to include confirmation prompt "${promptText}"`);
  }

  // 4. Success & Error toast notifications
  const requiredToasts = [
    'Login Successful!',
    'Account Created Successfully!',
    'Profile Updated Successfully!',
    'Password Changed Successfully!',
    'Product Added to Cart!',
    'Cart Updated Successfully!',
    'Item Removed Successfully!',
    'Order Placed Successfully!',
    'Message Sent Successfully!',
    'Order Status Updated Successfully!',
    'Deadline Updated Successfully!',
    'Changes Saved Successfully!',
    'Invalid Email or Password.',
    'Please Complete All Required Fields.',
    'The Selected File Is Not Supported.',
    'Failed to Send Message.'
  ];
  for (const toastText of requiredToasts) {
    assert.ok(mainJs.includes(toastText), `Expected main.js to include toast "${toastText}"`);
  }
});

test('Zero emojis across index.html, public/js/main.js, views/profile.php, and views/admin_dashboard.php', () => {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const allowedSymbols = new Set(['✓', '✕', '▾', '•', '★']);

  for (const relPath of ['index.html', 'public/js/main.js', 'views/profile.php']) {
    const content = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    const matches = content.match(emojiRegex) || [];
    const unexpected = matches.filter((ch) => !allowedSymbols.has(ch));
    assert.deepEqual(unexpected, [], `Unexpected emoji/dingbat in ${relPath}: ${unexpected.join(', ')}`);
  }
});
