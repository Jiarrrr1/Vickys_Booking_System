<template>
    <section id="policies">
  <div class="policies-inner">

    <div class="policies-header fade-up visible">
      <div class="section-label-center" style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
        <span style="width:40px;height:1px;background:var(--gold);display:block;"></span>
        <span style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:500;">Resort Guidelines</span>
        <span style="width:40px;height:1px;background:var(--gold);display:block;"></span>
      </div>
      <h2>Terms &amp; <em>Policies</em></h2>
      <p>To ensure a safe, respectful, and enjoyable experience for every guest, please read and observe the following policies during your stay at Vicky's Resort.</p>
    </div>

    <div class="policies-alert fade-up visible">
      <span class="policies-alert-icon">📌</span>
      <p>By confirming your booking, you agree to abide by all policies listed below. <strong>Vicky's Resort management reserves the right to enforce these guidelines</strong> and may refuse service in cases of policy violations. Thank you for helping us maintain a welcoming environment for all guests.</p>
    </div>

    <!-- POLICIES LIST -->
    <div class="pol-list-wrap fade-up visible">

      <!-- 1. Cancellation -->
      <div class="pol-row">
        <div class="pol-bar red"></div>
        <div class="pol-num-badge">01</div>
        <div class="pol-icon">🚫</div>
        <div class="pol-body">
          <div class="pol-body-title">Cancellation Policy <span class="pol-pill red">Non-Refundable</span></div>
          <div class="pol-body-text">All bookings are final and non-refundable. Guests are not allowed to cancel their reservation once it has been confirmed.</div>
        </div>
      </div>

      <!-- 2. Rebooking -->
      <div class="pol-row">
        <div class="pol-bar amber"></div>
        <div class="pol-num-badge">02</div>
        <div class="pol-icon">🔄</div>
        <div class="pol-body">
          <div class="pol-body-title">Rebooking Policy</div>
          <div class="pol-body-text">Guests may rebook to other available dates, subject to room or package availability.</div>
          <div class="pol-body-sublist">
            <div class="pol-body-subitem"><span class="pol-dot"></span>Rebooking must be communicated directly to resort staff.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Same-month bookings — inform staff at least <strong style="color:rgba(255,255,255,0.85);">1 week</strong> before your reserved date.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Advance bookings (next month or later) — notify staff <strong style="color:rgba(255,255,255,0.85);">1–2 weeks after booking</strong> to secure a new date.</div>
          </div>
        </div>
      </div>

      <!-- 3. Reservation -->
      <div class="pol-row">
        <div class="pol-bar gold"></div>
        <div class="pol-num-badge">03</div>
        <div class="pol-icon">💰</div>
        <div class="pol-body">
          <div class="pol-body-title">Reservation / Downpayment <span class="pol-pill gold">50% Required</span></div>
          <div class="pol-body-text">A 50% reservation fee is required to confirm all bookings. This fee is applied to the total package cost and guarantees your selected date.</div>
        </div>
      </div>

      <!-- 4. No-Show -->
      <div class="pol-row">
        <div class="pol-bar red"></div>
        <div class="pol-num-badge">04</div>
        <div class="pol-icon">⛔</div>
        <div class="pol-body">
          <div class="pol-body-title">No-Show Policy <span class="pol-pill red">Forfeiture</span></div>
          <div class="pol-body-text">If guests fail to arrive on the reserved date without prior notice, the reservation fee and payment will be forfeited. No refunds will be issued under any circumstances.</div>
        </div>
      </div>

      <!-- 5. Damage & Cleanliness -->
      <div class="pol-row">
        <div class="pol-bar teal"></div>
        <div class="pol-num-badge">05</div>
        <div class="pol-icon">🏠</div>
        <div class="pol-body">
          <div class="pol-body-title">Damage &amp; Cleanliness</div>
          <div class="pol-body-text">Guests are responsible for any damages caused to resort property during their stay.</div>
          <div class="pol-body-sublist">
            <div class="pol-body-subitem"><span class="pol-dot"></span>A damage fee will be charged for broken furniture or any damaged property.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Guests are expected to maintain reasonable cleanliness throughout their stay.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Resort staff handles normal cleaning — please avoid leaving excessive trash or disorder.</div>
          </div>
        </div>
      </div>

      <!-- 6. Food & Cooking -->
      <div class="pol-row">
        <div class="pol-bar green"></div>
        <div class="pol-num-badge">06</div>
        <div class="pol-icon">🍖</div>
        <div class="pol-body">
          <div class="pol-body-title">Food &amp; Cooking Rules</div>
          <div class="pol-body-sublist">
            <div class="pol-body-subitem"><span class="pol-dot"></span>Guests may bring their own food and beverages.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Cooking, grilling, or using resort facilities for food preparation is allowed in <strong style="color:rgba(255,255,255,0.85);">designated areas only</strong>.</div>
          </div>
        </div>
      </div>

      <!-- 7. Alcohol & Smoking -->
      <div class="pol-row">
        <div class="pol-bar blue"></div>
        <div class="pol-num-badge">07</div>
        <div class="pol-icon">🍺</div>
        <div class="pol-body">
          <div class="pol-body-title">Alcohol &amp; Smoking</div>
          <div class="pol-body-sublist">
            <div class="pol-body-subitem"><span class="pol-dot"></span>Alcohol consumption is permitted in open areas only, away from other guests.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Smoking is allowed only in <strong style="color:rgba(255,255,255,0.85);">designated outdoor spaces</strong> to ensure safety and comfort for all guests.</div>
          </div>
        </div>
      </div>

      <!-- 8. Pet Policy -->
      <div class="pol-row">
        <div class="pol-bar amber"></div>
        <div class="pol-num-badge">08</div>
        <div class="pol-icon">🐾</div>
        <div class="pol-body">
          <div class="pol-body-title">Pet Policy</div>
          <div class="pol-body-sublist">
            <div class="pol-body-subitem"><span class="pol-dot"></span>Guests may bring pets as long as they are controlled and non-aggressive.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Owners are fully responsible for their pet's behavior and cleanliness at all times.</div>
          </div>
        </div>
      </div>

      <!-- 9. Age Policy -->
      <div class="pol-row">
        <div class="pol-bar teal"></div>
        <div class="pol-num-badge">09</div>
        <div class="pol-icon">👧</div>
        <div class="pol-body">
          <div class="pol-body-title">Age Policy <span class="pol-pill teal">12 &amp; Below</span></div>
          <div class="pol-body-sublist">
            <div class="pol-body-subitem"><span class="pol-dot"></span>Children 12 years old and below must be accompanied by a responsible adult at all times.</div>
            <div class="pol-body-subitem"><span class="pol-dot"></span>Guests are fully responsible for the safety and supervision of minors throughout their stay.</div>
          </div>
        </div>
      </div>

    </div>

  </div>
</section>
</template>