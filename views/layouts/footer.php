</main> <!-- End page-content -->

<footer class="main-footer">
    <div class="footer-container">
        <div class="footer-col brand-col">
            <h3 class="footer-title">Lilia & Rowena Furniture</h3>
            <p class="footer-desc">
                Heirloom-grade solid wood furniture handcrafted by master carpenters in Pampanga & Manila. Custom dimensions, bespoke finishes, and direct workshop prices.
            </p>
            <div class="footer-badges">
                <span>✓ 100% Solid Hardwood</span>
                <span>✓ 5-Year Structural Warranty</span>
                <span>✓ Cash on Delivery & Downpayment Terms</span>
            </div>
        </div>

        <div class="footer-col">
            <h4>Furniture Collections</h4>
            <ul>
                <li><a href="index.php?route=catalog&category=1">Living Room Sofas & Tables</a></li>
                <li><a href="index.php?route=catalog&category=2">Dining Sets (4, 6, 8-Seater)</a></li>
                <li><a href="index.php?route=catalog&category=3">Solid Wood Bedframes</a></li>
                <li><a href="index.php?route=catalog&category=4">Executive Home Office Desks</a></li>
            </ul>
        </div>

        <div class="footer-col">
            <h4>Bespoke Services</h4>
            <ul>
                <li><a href="index.php?route=home#services">Custom Dimensions Carpentry</a></li>
                <li><a href="index.php?route=home#services">Wood Finishes & Stains</a></li>
                <li><a href="index.php?route=home#services">Antique Refinishing</a></li>
                <li><a href="index.php?route=track">Track Your Production</a></li>
            </ul>
        </div>

        <div class="footer-col contact-col">
            <h4>Workshop & Showroom</h4>
            <p><strong>Address:</strong> MacArthur Highway, San Fernando, Pampanga</p>
            <p><strong>Manila Dispatch:</strong> Quezon City, Metro Manila</p>
            <p><strong>Contact Phone:</strong> (045) 961-4288 / 0917-889-4211</p>
            <p><strong>Email:</strong> inquiries@liliaandrowena.com</p>
            <p><strong>Workshop Hours:</strong> Mon - Sat: 8:00 AM - 6:00 PM</p>
        </div>
    </div>

    <div class="footer-bottom">
        <p>&copy; <?= date('Y') ?> Lilia and Rowena Furniture. All rights reserved. Database-backed Shop Management System.</p>
    </div>
</footer>

<!-- Global Toast Notification Stack -->
<div id="globalToastContainer" class="ux-toast-container" aria-live="polite" aria-atomic="false"></div>

<!-- Reusable Confirmation Dialog Modal -->
<div id="uxConfirmModal" class="ux-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="uxConfirmTitle" aria-describedby="uxConfirmMessage" style="display: none;" onclick="if(event.target===this){closeConfirmModal();}">
    <div class="ux-confirm-card">
        <div class="ux-confirm-header">
            <div id="uxConfirmIconWrap" class="ux-confirm-icon-wrap variant-primary" aria-hidden="true">!</div>
            <div style="flex: 1; min-width: 0;">
                <h3 id="uxConfirmTitle" class="ux-confirm-title">Confirm Action</h3>
                <p id="uxConfirmMessage" class="ux-confirm-message">Are you sure you want to proceed?</p>
            </div>
        </div>
        <div class="ux-confirm-actions">
            <button type="button" id="uxConfirmCancelBtn" class="btn-confirm-cancel" onclick="closeConfirmModal()">Cancel</button>
            <button type="button" id="uxConfirmActionBtn" class="btn-confirm-primary" onclick="executeConfirmModalAction()">Confirm</button>
        </div>
    </div>
</div>

<!-- Clean, simple Vanilla JavaScript -->
<script src="js/main.js?v=20261107_v7" onerror="var s=document.createElement('script');s.src='public/js/main.js?v=20261107_v7';document.body.appendChild(s);"></script>
</body>
</html>
