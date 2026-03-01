<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-icon">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
      
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      
      <div class="not-found-actions">
        <router-link to="/" class="btn-primary">
          <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none;">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go to Dashboard
        </router-link>
        
        <button @click="$router.go(-1)" class="btn-g">
          <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none;">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 page - no logic needed
</script>

<style scoped>
.not-found-container {
  min-height: calc(100vh - var(--hh));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.not-found-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: var(--sand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-icon svg {
  width: 60px;
  height: 60px;
  stroke: var(--t3);
  fill: none;
  stroke-width: 2;
}

.not-found-content h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 72px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 8px;
  line-height: 1;
}

.not-found-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--t1);
  margin-bottom: 12px;
}

.not-found-content p {
  font-size: 14px;
  color: var(--t3);
  margin-bottom: 32px;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.not-found-actions .btn-primary,
.not-found-actions .btn-g {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>