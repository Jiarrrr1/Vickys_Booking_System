<template>
  <section class="section fu">
    <!-- Section Header -->
    <div class="shead">
      <div class="stitle">Revenue Analytics</div>
      <div class="sdesc">Track income by month or full year</div>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid c3 fu1">
      <StatCard
        value="₱125,000"
        label="This Month"
        color-class="cg"
        badge="+18%"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </template>
      </StatCard>

      <StatCard
        value="₱1,450,000"
        label="This Year"
        color-class="cb"
        badge="+24%"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </template>
      </StatCard>

      <StatCard
        value="142"
        label="Total Bookings"
        color-class="ca"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Revenue Table -->
    <div class="card fu2">
      <div class="card-head">
        <div>
          <div class="card-title">Monthly Revenue Breakdown</div>
          <div class="card-sub">Year 2026</div>
        </div>
      </div>

      <div class="twrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Bookings</th>
              <th>Revenue</th>
              <th>Avg per Booking</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="tdn">January</td>
              <td>24</td>
              <td class="tdm">₱145,000</td>
              <td>₱6,042</td>
              <td><span class="pill confirmed">+12%</span></td>
            </tr>
            <tr>
              <td class="tdn">February</td>
              <td>28</td>
              <td class="tdm">₱168,000</td>
              <td>₱6,000</td>
              <td><span class="pill confirmed">+16%</span></td>
            </tr>
            <tr>
              <td class="tdn">March</td>
              <td>31</td>
              <td class="tdm">₱186,000</td>
              <td>₱6,000</td>
              <td><span class="pill confirmed">+11%</span></td>
            </tr>
            <tr>
              <td class="tdn">April</td>
              <td>26</td>
              <td class="tdm">₱156,000</td>
              <td>₱6,000</td>
              <td><span class="pill pending">-16%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Note about future implementation -->
    <div style="margin-top: 24px; padding: 20px; background: var(--blue-lt); border-radius: var(--r); border: 1px solid var(--border);">
      <p style="font-size: 13px; color: var(--t2); margin-bottom: 8px;">
        <strong>📊 Revenue Analytics Coming Soon</strong>
      </p>
      <p style="font-size: 12px; color: var(--t3);">
        Full revenue analytics with charts, export functionality, and detailed breakdowns will be available in the next update. 
        Connect to your backend API to see real-time revenue data.
      </p>
    </div>
  </section>
</template>

<script setup>
import StatCard from '@/components/StatCard.vue'
</script>

<style scoped>
/* Revenue specific styles */
</style>